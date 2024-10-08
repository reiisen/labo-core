import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
const MAX_TIMESLOT = 11;
const MAX_DAY = 6

const prisma = new PrismaClient();

type ScheduleRequest = {
  subjectId: number,
  labId: number,
  timeslot: number,
  day: number
}

export type Schedule = {
  id: number | undefined,
  timeslot: number,
  day: number,
  subjectId: number,
  labId: number
}

export const create = async (
  req: Request<ScheduleRequest>,
  res: Response<Schedule>,
) => {
  const request: ScheduleRequest = req.body;

  const schedule: Prisma.ScheduleCreateInput = {
    timeslot: request.timeslot,
    day: request.day,
    subject: {
      connect: { id: request.subjectId }
    },
    lab: {
      connect: { id: request.labId }
    }
  }

  await prisma.schedule.create({ data: schedule })
    .then((result) => {
      res.status(200);
      res.send(result);
    });
}
