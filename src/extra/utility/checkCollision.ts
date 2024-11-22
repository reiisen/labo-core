import { PrismaClient } from "@prisma/client";
import type { Reserve } from "@prisma/client";
import { getConfig } from "./config";

const prisma = new PrismaClient();

export async function checkReserveCollision(request: Omit<Reserve, 'id'>): Promise<boolean> {
  console.log(JSON.stringify(request, null, 2));
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
