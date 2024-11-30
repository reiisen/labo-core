import { PrismaClient, Prisma } from "@prisma/client";
import type { Room } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const create = async (
  req: Request<Omit<Room, 'id'>>,
  res: Response<Room>
) => {
  let room: Prisma.RoomCreateInput
  room = req.body
  await prisma.room.create({ data: room })
    .then((result) => {
      res.status(200);
      res.send(result);
    })
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Room | null>,
) => {
  const id = parseInt(req.params.id);
  const room = await prisma.room.findUnique({
    where: {
      id: id
    }
  })
  res.status(200).send(room);
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Room[] | null>,
) => {
  const room = await prisma.room.findMany()
  res.status(200).send(room);
}

export const read = async (
  req: Request<Partial<Omit<Room, "id">> | Pick<Room, "id">>,
  res: Response<Room[]>
) => {
  const filter: Partial<Omit<Room, "id">> | Pick<Room, "id"> = req.body;
  try {
    const room = await prisma.room.findMany({
      where: filter
    });
    res.status(200).send(room);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Room>,
  res: Response<Room | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data: Room = req.body;
  data.updatedAt = new Date();
  const room = await prisma.room.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(room);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.room.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
