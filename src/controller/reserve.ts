import { PrismaClient, Prisma } from "@prisma/client";
import type { Reserve } from "@prisma/client";
import { Request, Response } from "express";
import { jobs, runStatusJob } from "../job/status";
import { getConfig } from "../extra/utility/config";
import { checkReserveCollision } from "../extra/utility/checkCollision";

const prisma = new PrismaClient();

export const create = async (
  req: Request<Omit<Reserve, 'id' | 'status'>>,
  res: Response<Reserve | string>,
) => {
  let request: Omit<Reserve, 'id'>;
  console.log("WHY: \n" + JSON.stringify(req.body));
  try {
    request = { ...req.body, date: new Date(req.body.date) }
  } catch {
    res.status(400);
    res.send("It seems the requested JSON body was incorrect")
    return;
  }
  console.log("Reservation creation request received")

  console.log("DA REQUEST:\n" + JSON.stringify(request, null, 2));
  console.log("DA DATATYPE NOW: " + typeof request.date)

  const reserveHour = request.date.getHours();
  const reserveDay = request.date.getDay();

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

    if (reserveHour + 7 < new Date().getHours()) {
      res.status(400);
      res.send("The requested Reservation has already went past the hour")
    }
  }

  const reserve: Prisma.ReserveCreateInput = {
    lab: {
      connect: { id: request.labId }
    },
    name: request.name,
    reason: request.reason,
    status: "PENDING",
    date: request.date,
    length: request.length
  }

  if (await checkReserveCollision(request)) {
    res.status(400);
    res.send("The requested schedule collides with other existing schedule");
    return console.log("Reservation Failed");
  }
  await prisma.reserve.create({ data: reserve })
    .then(async (result) => {
      console.log("Creating a job for managing statuses..");
      runStatusJob(result);
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
  const data = req.body
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
    if (check.status === "PENDING") {
      job[0].stop();
    } else job[1].stop();
    console.log("stopped job");
  }

  jobs.delete(id);
  res.status(200).send(reserve);
}

export const getActiveJobs = async (
  req: Request,
  res: Response<{ id: number; jobs: { start: { running: boolean, date: string }, finish: { running: boolean, date: string } } }[]>
) => {
  let activeJobs:
    {
      id: number;
      jobs: {
        start: { running: boolean, date: string },
        finish: { running: boolean, date: string }
      }
    }[] = [];

  for (const [id, job] of jobs.entries()) {
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
      });
  }

  res.status(200).send(activeJobs);
};

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
