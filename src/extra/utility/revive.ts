import { PrismaClient } from "@prisma/client";
import { runStatusJob } from "../../job/status";

const prisma = new PrismaClient();

const exeVars = [process.env.recheck, process.env.revive];

function normalize(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setMinutes(0, 0, 0);
  return normalizedDate;
}

export async function recheck() {
  const now = normalize(new Date());
  const scheduledForActive: number[] = [];
  const scheduledForConcluded: number[] = [];

  try {
    const pending = await prisma.reserve.findMany({
      where: {
        status: 'PENDING'
      },
    });

    console.log('Pending reservations:', pending.length);

    pending.forEach((reservation) => {
      const reservationDate = normalize(reservation.date);
      if (now.getTime() === reservationDate.getTime()) {
        scheduledForActive.push(reservation.id);
      } else if (now.getTime() > reservationDate.getTime()) {
        scheduledForConcluded.push(reservation.id);
      }
    });

    await prisma.reserve.updateMany({
      where: { id: { in: scheduledForActive } },
      data: { status: 'ACTIVE' },
    });

    await prisma.reserve.updateMany({
      where: {
        id: {
          in: scheduledForConcluded
        }
      },
      data: {
        status: 'CONCLUDED'
      },
    });

    console.log('Updated PENDING reservations.');

    const active = await prisma.reserve.findMany({
      where: { status: 'ACTIVE' },
    });

    const activeToConclude: number[] = [];
    active.forEach((reservation) => {
      if (now.getTime() > normalize(reservation.date).getTime()) {
        activeToConclude.push(reservation.id);
      }
    });

    await prisma.reserve.updateMany({
      where: {
        id: {
          in: activeToConclude
        }
      },
      data: {
        status: 'CONCLUDED'
      },
    });

    console.log('Recheck complete.');
    return;
  } catch (error) {
    console.error('Error during recheck:', error);
  }
}

export async function revive() {
  const now = normalize(new Date());
  try {
    const futures = await prisma.reserve.findMany({
      where: {
        date: {
          gt: now
        }
      },
    });

    futures.forEach((reservation) => {
      const reservationDate = normalize(reservation.date);
      if (now.getTime() === reservationDate.getTime()) {
        runStatusJob(reservation, true);
      } else {
        runStatusJob(reservation);
      }
    });

    console.log('Revive complete.');
    return;
  } catch (error) {
    console.error('Error during revive:', error);
  }
}

(async () => {
  try {
    recheck()
    revive()
  } catch (error) {
    console.error('Error during execution:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
})();
