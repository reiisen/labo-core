import { PrismaClient } from "@prisma/client";
import type { Computer } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const create = async (
  req: Request<{ name: string, labId: number }>,
  res: Response<Computer>
) => {
  let computer = req.body
  await prisma.computer.create({
    data: {
      name: computer.name,
      lab: {
        connect: { id: computer.labId }
      }
    }
  })
    .then((result) => {
      res.status(200);
      res.send(result);
    })
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Computer | null>,
) => {
  const id = parseInt(req.params.id);
  const computer = await prisma.computer.findUnique({
    where: {
      id: id
    }
  })
  res.status(200).send(computer);
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Computer[] | null>,
) => {
  const computer = await prisma.computer.findMany()
  res.status(200).send(computer);
}

export const read = async (
  req: Request<Partial<Omit<Computer, "id">> | Pick<Computer, "id">>,
  res: Response<Computer[]>
) => {
  const filter: Partial<Omit<Computer, "id">> | Pick<Computer, "id"> = req.body;
  try {
    const computer = await prisma.computer.findMany({
      where: filter
    });
    res.status(200).send(computer);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Computer>,
  res: Response<Computer | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data: Computer = req.body;
  data.updatedAt = new Date();
  const computer = await prisma.computer.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(computer);
}

export const remove = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.computer.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
