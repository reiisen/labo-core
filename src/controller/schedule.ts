import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
const MAX_TIMESLOT = 11;
const MAX_DAY = 4;
const MAX_LENGTH = 3;

const prisma = new PrismaClient();

interface ScheduleRequest {
  subjectId: number,
  labId: number,
  timeslot: number,
  day: number,
  length: number
}

export interface Schedule {
  id: number | undefined,
  day: number,
  subjectId: number,
  labId: number
  timeslot: number,
  length: number,

}

async function checkCollision(request: Prisma.ScheduleCreateInput): Promise<boolean> {
  const schedule = await prisma.schedule.findMany({
    where: {
      day: request.day
    }
  });
  const map = Array<boolean>(MAX_TIMESLOT + 1).fill(false);
  schedule.forEach(
    (value) => {
      const timeslot = value.timeslot;
      const length = value.length;
      console.log(timeslot);
      console.log(length);
      console.log(timeslot + length)
      for (let i = timeslot; i < (timeslot + length); i++) {
        console.log("HIIIII");
        map[i] = true;
      }
      console.log("XD");
    }
  );
  console.log(map);
  let timeslot = request.timeslot;
  const length = request.length;
  for (let i = timeslot; i < (timeslot + length); i++) {
    if (map[timeslot] === true) {
      console.log("returning true...");
      return true;
    }
  }

  console.log("returning false...");
  return false;
}

export const create = async (
  req: Request<ScheduleRequest>,
  res: Response<Schedule | string>,
) => {
  let request: ScheduleRequest;
  try {
    request = req.body;
  } catch {
    res.status(400);
    res.send("It seems the requested JSON body was incorrect")
    return;
  }

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

  if (request.length > MAX_LENGTH || request.length < 0) {
    res.status(400);
    res.send("The length of the requested schedule can't be negative or above the defined MAX_LENGTH")
    return;
  }

  const schedule: Prisma.ScheduleCreateInput = {
    subject: {
      connect: { id: request.subjectId }
    },
    lab: {
      connect: { id: request.labId }
    },
    timeslot: request.timeslot,
    day: request.day,
    length: request.length
  }

  if (await checkCollision(schedule)) {
    res.status(400);
    res.send("The requested schedule collides with other existing schedule");
    return;
  }
  await prisma.schedule.create({ data: schedule })
    .then((result) => {
      res.status(200).send(result);
    });
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Schedule[] | null>,
) => {
  const schedules = await prisma.schedule.findMany()
  res.status(200).send(schedules);
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Schedule>
) => {
  const id: number = parseInt(req.params.id);
  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id
      }
    });
    if (!schedule) {
      res.status(404).send();
      return;
    }
    res.status(200).send(schedule);
  } catch {
    res.status(400).send();
  }
}

export const read = async (
  req: Request<Partial<Omit<Schedule, "id">> | Pick<Schedule, "id">>,
  res: Response<Schedule[]>
) => {
  const filter: Partial<Schedule> = req.body;
  try {
    const schedules = await prisma.schedule.findMany({
      where: filter
    });
    if (Object.keys(schedules).length === 0) {
      res.status(404).send();
      return;
    }
    res.status(200).send(schedules);
  } catch {
    res.status(400).send();
  }
}
