import { PrismaClient, Prisma } from "@prisma/client";
import type { Reserve } from "@prisma/client";
import { Request, Response } from "express";
const MAX_TIMESLOT = 11;
const MAX_DAY = 4;
const MAX_LENGTH = 1;

const prisma = new PrismaClient();

async function checkCollision(request: Prisma.ScheduleCreateInput | Prisma.ReserveCreateInput): Promise<boolean> {
  const combined = [
    ...await prisma.schedule.findMany({
      where: {
        day: request.day
      }
    }),
    ...await prisma.reserve.findMany({
      where: {
        day: request.day
      }
    })
  ]

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

export const create = async (
  req: Request<Omit<Reserve, 'id'>>,
  res: Response<Reserve | string>,
) => {
  let request: Omit<Reserve, 'id'>;
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

  if (request.timeslot + request.length - 1 > MAX_TIMESLOT) {
    res.status(400);
    res.send("The requested schedule went beyond the defined MAX_LENGTH")
    return;
  }

  const reserve: Prisma.ReserveCreateInput = {
    user: {
      connect: { id: request.userId }
    },
    lab: {
      connect: { id: request.labId }
    },
    reason: request.reason,
    status: "PENDING",
    timeslot: request.timeslot,
    day: request.day,
    length: request.length
  }

  if (await checkCollision(reserve)) {
    res.status(400);
    res.send("The requested schedule collides with other existing schedule");
    return;
  }
  await prisma.reserve.create({ data: reserve })
    .then((result) => {
      res.status(200).send(result);
    });
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Reserve[] | null>,
) => {
  const reserves = await prisma.reserve.findMany()
  res.status(200).send(reserves);
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Reserve>
) => {
  const id: number = parseInt(req.params.id);
  try {
    const reserve = await prisma.reserve.findUnique({
      where: {
        id: id
      }
    });
    if (!reserve) {
      res.status(404).send();
      return;
    }
    res.status(200).send(reserve);
  } catch {
    res.status(400).send();
  }
}

export const read = async (
  req: Request<Partial<Omit<Reserve, "id">> | Pick<Reserve, "id">>,
  res: Response<Reserve[]>
) => {
  const filter: Partial<Omit<Reserve, "id">> | Pick<Reserve, "id"> = req.body;
  try {
    const reserves = await prisma.reserve.findMany({
      where: filter
    });
    if (Object.keys(reserves).length === 0) {
      res.status(404).send();
      return;
    }
    res.status(200).send(reserves);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Reserve>,
  res: Response<Reserve | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data = req.body
  const reserve = await prisma.reserve.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(reserve);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.reserve.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
