import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
const MAX_TIMESLOT = 11;
const MAX_DAY = 6;
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
  timeslot: number,
  day: number,
  subjectId: number,
  labId: number
}

export const create = async (
  req: Request<ScheduleRequest>,
  res: Response<Schedule | string>,
) => {
  const request: ScheduleRequest = req.body;

  if (request.timeslot > MAX_TIMESLOT || request.timeslot < 0) {
    res.status(400);
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

  await prisma.schedule.create({ data: schedule })
    .then((result) => {
      res.status(200);
      res.send(result);
    });
}
