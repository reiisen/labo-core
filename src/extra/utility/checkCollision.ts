import { PrismaClient } from "@prisma/client";
import type { Reserve, Schedule } from "@prisma/client";
import env from "../env/appenv";

const [MAX_TIMESLOT, MAX_DAY, MAX_SCHEDULE_LENGTH, MAX_RESERVE_LENGTH] = env;
const prisma = new PrismaClient();

export default async function checkCollision(request: Omit<Schedule, 'id'> | Omit<Reserve, 'id'>): Promise<boolean> {
  const combined = [
    ...await prisma.schedule.findMany({
      where: {
        day: request.day,
        lab: {
          id: request.labId
        }
      }
    }),
    ...await prisma.reserve.findMany({
      where: {
        day: request.day,
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

  const map = Array<boolean>(MAX_TIMESLOT + 1).fill(false);
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

