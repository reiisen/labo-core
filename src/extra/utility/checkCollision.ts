import { PrismaClient } from "@prisma/client";
import type { Reserve, Course } from "@prisma/client";
import config from "./config";

const prisma = new PrismaClient();

export async function checkCourseCollision(request: Omit<Course, 'id'>): Promise<boolean> {
  const combined = [
    ...await prisma.course.findMany({
      where: {
        day: request.day,
        lab: {
          id: request.labId
        }
      }
    })
  ];

  const map = Array<boolean>(config.maxTimeslot + 1).fill(false);
  combined.forEach(
    (value) => {
      const timeslot = value.timeslot;
      const length = value.length;
      for (let i = timeslot; i < (timeslot + length); i++) {
        map[i] = true;
      }
    }
  );

  let timeslot = request.timeslot;
  const length = request.length;

  for (let i = timeslot; i < (timeslot + length); i++) {
    if (map[i] === true) {
      return true;
    }
  }

  return false;
}

export async function checkReserveCollision(request: Omit<Reserve, 'id'>): Promise<boolean> {
  const courses = [
    ...await prisma.course.findMany({
      where: {
        day: request.date.getHours(),
        lab: {
          id: request.labId
        }
      }
    })]
  const reserves = [
    ...await prisma.reserve.findMany({
      where: {
        date: request.date,
        lab: {
          id: request.labId
        },
        OR: [
          {
            status: "ACTIVE"
          },
          {
            status: "PENDING"
          }
        ]
      }
    })
  ];

  const map = Array<boolean>(config.maxTimeslot + 1).fill(false);
  courses.forEach(
    (value) => {
      const timeslot = value.timeslot;
      const length = value.length;
      for (let i = timeslot; i < (timeslot + length); i++) {
        map[i] = true;
      }
    }
  );

  reserves.forEach(
    (value) => {
      const timeslot = value.date.getHours();
      const length = value.length;
      for (let i = timeslot; i < (timeslot + length); i++) {
        map[i] = true;
      }
    }
  );
  let timeslot = request.date.getHours();
  const length = request.length;

  for (let i = timeslot; i < (timeslot + length); i++) {
    if (map[i] === true) {
      return true;
    }
  }

  return false;
}
