import { PrismaClient, Prisma } from "@prisma/client";
import type { Schedule } from "@prisma/client"
import { Request, Response } from "express";
import checkCollision from "../extra/utility/checkCollision"
import config from "../extra/utility/config";

const prisma = new PrismaClient();

export const create = async (
  req: Request<Omit<Schedule, 'id'>>,
  res: Response<Schedule | string>,
) => {
  let request: Omit<Schedule, 'id'>;
  try {
    request = req.body;
  } catch {
    res.status(400);
    res.send("It seems the requested JSON body was incorrect")
    return;
  }

  if (request.timeslot > config.maxTimeslot || request.timeslot < 0) {
    res.status(400)
    res.send("The specified timeslot of the requested schedule can't be negative nor above the defined MAX_TIMESLOT");
    return;
  }

  if (request.day > config.maxDay || request.day < 0) {
    res.status(400);
    res.send("The specified data of the requested schedule can't be negative nor above the defined MAX_DAY")
    return;
  }

  if (request.length > config.maxScheduleLength || request.length < 0) {
    res.status(400);
    res.send("The length of the requested schedule can't be negative or above the defined MAX_SCHEDULE_LENGTH")
    return;
  }

  if (request.timeslot + request.length - 1 > config.maxTimeslot) {
    res.status(400);
    res.send("The requested schedule went beyond the defined MAX_SCHEDULE_LENGTH")
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

  if (await checkCollision(request)) {
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
  req: Request<Partial<Schedule & { includeSubject: boolean }>>,
  res: Response<Schedule[]>
) => {
  const request: Partial<Schedule> & { includeSubject: boolean } = req.body;
  const { includeSubject, ...scheduleData } = request;
  let include: { subject: boolean };
  if (request.includeSubject) {
    include = {
      subject: true
    }
  } else {
    include = {
      subject: false
    }
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: scheduleData,
      include: include
    });
    res.status(200).send(schedules);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Schedule>,
  res: Response<Schedule | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data = req.body
  const schedule = await prisma.schedule.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(schedule);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.schedule.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
