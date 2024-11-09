import { PrismaClient, Prisma } from "@prisma/client";
import type { Course } from "@prisma/client"
import { Request, Response } from "express";
import config from "../extra/utility/config";
import { checkCourseCollision } from "../extra/utility/checkCollision";

const prisma = new PrismaClient();

export const create = async (
  req: Request<Omit<Course, 'id'>>,
  res: Response<Course | string>,
) => {
  let request: Omit<Course, 'id'>;
  try {
    request = req.body;
  } catch {
    res.status(400);
    res.send("It seems the requested JSON body was incorrect")
    return;
  }

  if (request.timeslot > config.maxTimeslot || request.timeslot < config.minTimeslot) {
    res.status(400)
    res.send("The specified timeslot of the requested course can't be negative nor above the defined MAX_TIMESLOT");
    return;
  }

  if (request.day > config.maxDay || request.day < config.minDay) {
    res.status(400);
    res.send("The specified data of the requested course can't be less than one nor above the defined MAX_DAY")
    return;
  }

  if (request.length > config.maxCourseLength || request.length < 0) {
    res.status(400);
    res.send("The length of the requested course can't be negative or above the defined MAX_COURSE_LENGTH")
    return;
  }

  if (request.timeslot + request.length - 1 > config.maxTimeslot) {
    res.status(400);
    res.send("The requested course went beyond the defined MAX_course_LENGTH")
    return;
  }

  const course: Prisma.CourseCreateInput = {
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

  if (await checkCourseCollision(request)) {
    res.status(400);
    res.send("The requested course collides with other existing course");
    return;
  }
  await prisma.course.create({ data: course })
    .then((result) => {
      res.status(200).send(result);
    });
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Course[] | null>,
) => {
  const courses = await prisma.course.findMany()
  res.status(200).send(courses);
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Course>
) => {
  const id: number = parseInt(req.params.id);
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: id
      }
    });
    if (!course) {
      res.status(404).send();
      return;
    }
    res.status(200).send(course);
  } catch {
    res.status(400).send();
  }
}

export const read = async (
  req: Request<Partial<Course & { includeSubject: boolean }>>,
  res: Response<Course[]>
) => {
  const request: Partial<Course> & { includeSubject: boolean } = req.body;
  const { includeSubject, ...courseData } = request;
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
    const courses = await prisma.course.findMany({
      where: courseData,
      include: include
    });
    res.status(200).send(courses);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Course>,
  res: Response<Course | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data = req.body
  const course = await prisma.course.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(course);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.course.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
