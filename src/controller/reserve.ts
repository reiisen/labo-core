import { PrismaClient, Prisma } from "@prisma/client";
import type { Reserve } from "@prisma/client";
import { Request, Response } from "express";
import env from "../extra/env/appenv"
import checkCollision from "../extra/utility/checkCollision";
import { jobs, runStatusJob } from "../job/status";

const [MAX_TIMESLOT, MAX_DAY, MAX_SCHEDULE_LENGTH, MAX_RESERVE_LENGTH] = env;

const prisma = new PrismaClient();

export const create = async (
  req: Request<Omit<Reserve, 'id'>>,
  res: Response<Reserve | string>,
) => {
  let request: Omit<Reserve, 'id'>;
  try {
    request = req.body;
  } catch {
    res.status(400);
    res.send("It seems the requested JSON body was incorrect")
    return;
  }
  console.log("Schedule creation request received")

  if (request.timeslot > MAX_TIMESLOT || request.timeslot < 0) {
    res.status(400)
    res.send("The specified timeslot of the requested schedule can't be negative nor above the defined MAX_TIMESLOT");
    return;
  }

  if (request.day > MAX_DAY || request.day < 0) {
    res.status(400);
    res.send("The specified data of the requested schedule can't be negative nor above the defined MAX_DAY")
    return;
  }

  if (request.length > MAX_RESERVE_LENGTH || request.length < 0) {
    res.status(400);
    res.send("The length of the requested schedule can't be negative or above the defined MAX_SCHEDULE_LENGTH")
    return;
  }

  if (request.timeslot + request.length - 1 > MAX_TIMESLOT) {
    res.status(400);
    res.send("The requested schedule went beyond the defined MAX_SCHEDULE_LENGTH")
    return;
  }

  const reserve: Prisma.ReserveCreateInput = {
    user: {
      connect: { id: request.userId }
    },
    lab: {
      connect: { id: request.labId }
    },
    reason: request.reason,
    status: "PENDING",
    timeslot: request.timeslot,
    day: request.day,
    length: request.length
  }

  if (await checkCollision(request)) {
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
  res: Response<{ id: number; running: { start: boolean, finish: boolean } }[]>
) => {
  let activeJobs: { id: number; running: { start: boolean, finish: boolean } }[] = [];

  for (const [id, job] of jobs.entries()) {
    activeJobs.push({ id: Number(id), running: { start: job[0].running, finish: job[1].running } });
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
