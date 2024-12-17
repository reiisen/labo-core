import { PrismaClient, Prisma } from "@prisma/client";
import type { Reserve } from "@prisma/client";
import { Request, Response } from "express";
import { jobs, runStatusJob } from "../job/status";
import { getConfig } from "../extra/utility/config";
import { checkReserveCollision } from "../extra/utility/checkCollision";
import { recheck, revive } from "../extra/utility/revive";

const prisma = new PrismaClient();

export function isBetweenInterval(target: Date, start: Date, end: Date): boolean {
  if (target < start || target > end) return false; else return true;
}

export const create = async (
  req: Request<Omit<Reserve, "id">>,
  res: Response<Reserve | string>,
) => {
  let request: Omit<Reserve, "id">;
  console.log("WHY: \n" + JSON.stringify(req.body));

  try {
    request = { ...req.body, date: new Date(req.body.date) }
  } catch {
    res.status(400);
    res.send("It seems the requested JSON body was incorrect")
    return;
  }

  if ((request.labId || request.computerId) && request.roomId) {
    res.status(400);
    res.send("It seems the reequested JSON body was trying to reserve both a room and a lab/computer")
    return;
  }

  if (request.labId && request.computerId) {
    const labCheck = await prisma.lab.findUnique({
      where: {
        id: request.labId
      },
      select: {
        inactive: true
      }
    })

    if (labCheck) {
      if (labCheck.inactive) {
        res.status(400);
        res.send("The lab is not for reservation")
        return;
      }
    } else {
      res.status(400);
      res.send("Yeah the lab doesn't exist");
      return;
    }

    const computerCheck = await prisma.computer.findUnique({
      where: {
        id: request.labId
      },
      select: {
        inactive: true
      }
    })

    if (computerCheck) {
      if (computerCheck.inactive) {
        res.status(400);
        res.send("The computer is not for reservation")
        return;
      }
    } else {
      res.status(400);
      res.send("Yeah the computer doesn't exist");
      return;
    }
  } else if (request.roomId) {
    const roomCheck = await prisma.room.findUnique({
      where: {
        id: request.roomId
      },
      select: {
        inactive: true
      }
    })
    if (roomCheck) {
      if (roomCheck.inactive) {
        res.status(400);
        res.send("The room is not for reservation")
      }
    } else {
      res.status(400);
      res.send("Yeah the room doesn't exist");
      return;
    }
  } else {
    res.status(400);
    res.send("How did we get here? (1)");
  }

  console.log("Reservation creation request received")

  console.log("DA REQUEST:\n" + JSON.stringify(request, null, 2));
  console.log("DA DATATYPE NOW: " + typeof request.date)

  const reserveDate = request.date;
  const reserveHour = reserveDate.getHours();
  const reserveDay = reserveDate.getDay();
  const currentDate = new Date();
  const interval1 = new Date(currentDate);
  const interval2 = new Date(currentDate);
  interval1.setHours(interval1.getHours(), 0, 0, 0)
  interval2.setHours(interval2.getHours() + 1, 0, 0, 0)
  console.log("INTERVAL 1: " + interval1);
  console.log("INTERVAL 2: " + interval2);
  console.log("dettt: " + request.date);
  console.log("ellllldedlelelelele: " + isBetweenInterval(request.date, interval1, interval2));

  console.log("RESERVE HOUR: " + reserveHour);
  console.log("getConfig() MAX HOUR: " + getConfig().maxTimeslot);
  console.log(getConfig().ignoreTimeslotBoundary);
  if (!getConfig().ignoreTimeslotBoundary) {
    if (reserveHour > getConfig().maxTimeslot || reserveHour < getConfig().minTimeslot) {
      res.status(400)
      res.send("The specified timeslot of the requested Reservation can't be negative nor above the defined MAX_TIMESLOT");
      return;
    }
  }

  console.log(getConfig().ignoreDayBoundary);
  console.log("RESERVE DAY: " + reserveDay);
  console.log("getConfig() MAX DAY: " + getConfig().maxDay);
  if (!getConfig().ignoreDayBoundary) {
    if (reserveDay > getConfig().maxDay || reserveDay < getConfig().minDay) {
      res.status(400);
      res.send("The specified day of the requested Reservation can't be negative nor above the defined MAX_DAY")
      return;
    }
  }

  console.log(getConfig().ignoreLengthBoundary);
  if (!getConfig().ignoreLengthBoundary) {
    if (request.length > getConfig().maxReserveLength || request.length < 0) {
      res.status(400);
      res.send("The length of the requested Reservation can't be negative or above the defined MAX_RESERVE_LENGTH")
      return;
    }

    if (reserveHour + request.length - 1 > getConfig().maxTimeslot) {
      res.status(400);
      res.send("The requested Reservation went beyond the defined MAX_RESERVE_LENGTH")
      return;
    }

    if (reserveDate < interval1) {
      res.status(400);
      res.send("The current date has went past the requested Reservation date")
      return;
    }
  }

  console.log("WTF" + request.date.getHours());
  console.log("OKBRO" + currentDate.getHours());

  let reserve: Prisma.ReserveCreateInput;

  if (request.roomId) {
    reserve = {
      room: {
        connect: { id: request.roomId }
      },
      nim: request.nim,
      reason: request.reason,
      status: (isBetweenInterval(reserveDate, interval1, interval2)) ? "ACTIVE" : "PENDING",
      date: request.date,
      length: request.length
    }
  } else if (request.labId && request.computerId) {
    reserve = {
      lab: {
        connect: { id: request.labId }
      },
      computer: {
        connect: { id: request.computerId }
      },
      nim: request.nim,
      reason: request.reason,
      status: (isBetweenInterval(request.date, interval1, interval2)) ? "ACTIVE" : "PENDING",
      date: request.date,
      length: request.length
    }
  } else {
    res.status(400).send("How did we get here? (2)");
    return;
  }


  try {
    if (await checkReserveCollision(request)) {
      res.status(400);
      res.send("The requested schedule collides with other existing schedule");
      return console.log("Reservation Failed");
    }
  } catch {
    (e: string) => {
      res.status(400);
      res.send(e);
      return;
    };
  }

  await prisma.reserve.create({ data: reserve })
    .then(async (result) => {
      console.log("Creating a job for managing statuses..");
      isBetweenInterval(request.date, interval1, interval2) ? runStatusJob(result, true) : runStatusJob(result);
      console.log("Job created")
      res.status(200).send(result);
      console.log("Successfully created a reservation for:\n" + JSON.stringify(result));
    });
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Reserve[] | null>,
) => {
  const reserves = await prisma.reserve.findMany()
  res.status(200).send(reserves);
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Reserve>
) => {
  const id: number = parseInt(req.params.id);
  try {
    const reserve = await prisma.reserve.findUnique({
      where: {
        id: id
      }
    });
    if (!reserve) {
      res.status(404).send();
      return;
    }
    res.status(200).send(reserve);
  } catch {
    res.status(400).send();
  }
}

export const read = async (
  req: Request<Partial<Omit<Reserve, "id">> | Pick<Reserve, "id">>,
  res: Response<Reserve[]>
) => {
  console.log(JSON.stringify(req.body, null, 2));
  const filter: Partial<Omit<Reserve, "id">> | Pick<Reserve, "id"> = req.body;
  try {
    const reserves = await prisma.reserve.findMany({
      where: filter
    });
    res.status(200).send(reserves);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Reserve>,
  res: Response<Reserve | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data: Reserve = req.body
  data.updatedAt = new Date();
  const reserve = await prisma.reserve.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(reserve);
}

export const cancel = async (
  req: Request<Reserve>,
  res: Response<Reserve | string | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }

  const check = await prisma.reserve.findUnique({
    where: {
      id: id
    }
  });

  if (!check) {
    res.status(404).send('Reservation does not exist');
    return;
  }

  if (check.status === "CONCLUDED") {
    res.status(400).send('This reservation has already concluded');
    return;
  }

  if (check.status === "CANCELLED") {
    res.status(400).send('This reservation has already cancelled');
    return;
  }

  const reserve = await prisma.reserve.update({
    where: {
      id: id
    },
    data: {
      status: "CANCELLED"
    }
  });

  const job = jobs.get(id);

  if (job !== undefined) {
    if (check.status === "PENDING" && job.length === 2) {
      job[0].stop();
      job[1].stop();
    } else {
      job[0].stop();
    }
  }

  jobs.delete(id);
  res.status(200).send(reserve);
}

type activeJob = {
  id: number;
  jobs:
  {
    start?:
    {
      running: boolean,
      date: string
    },
    finish:
    {
      running: boolean,
      date: string
    }
  };
}

export const getActiveJobs = async (
  req: Request,
  res: Response<activeJob[]>
) => {
  let activeJobs: activeJob[] = [];

  for (const [id, job] of jobs.entries()) {
    if (job.length === 2) {
      activeJobs.push(
        {
          id: Number(id),
          jobs: {
            start:
            {
              running: job[0].running,
              date: job[0].nextDate().toISO() ?
                job[0].nextDate().toISO()! :
                "Invalid Date"
            },
            finish:
            {
              running: job[1].running,
              date: job[1].nextDate().toISO() ?
                job[1].nextDate().toISO()! :
                "Invalid Date"
            }
          }
        }
      );
    } else {
      activeJobs.push(
        {
          id: Number(id),
          jobs: {
            finish:
            {
              running: job[0].running,
              date: job[0].nextDate().toISO() ?
                job[0].nextDate().toISO()! :
                "Invalid Date"
            }
          }
        }
      );
    }
  }

  res.status(200).send(activeJobs);
};

export const recheckAndRevive = async (
  req: Request,
  res: Response
) => {
  try {
    await recheck();
    await revive();
  } catch (e) {
    res.status(400);
    res.send();
    return;
  }

  res.status(400);
  res.send();
  return;
}

export const remove = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.reserve.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
