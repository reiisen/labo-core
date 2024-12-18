import { PrismaClient } from "@prisma/client";
import type { Reserve } from "@prisma/client";
import { getConfig } from "./config";

const prisma = new PrismaClient();

export async function checkReserveCollision(request: Omit<Reserve, 'id'>): Promise<boolean> {
  console.log(JSON.stringify(request, null, 2));
  let reserves: typeof request[];

  if (request.roomId) {
    reserves = [
      ...await prisma.reserve.findMany({
        where: {
          date: request.date,
          room: {
            id: request.roomId,
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
    ]
  } else if (request.labId && request.computerId) {
    reserves = [
      ...await prisma.reserve.findMany({
        where: {
          date: request.date,
          computer: {
            id: request.computerId
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
    ]
  } else {
    throw new Error("I don't know how do we even get here, maybe the type is wrong...");
  }

  const map = Array<boolean>(getConfig().maxTimeslot + 1).fill(false);
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
