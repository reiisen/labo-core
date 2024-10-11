import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export interface Lab {
  id: number | undefined,
  name: string,
  code: string,
  floor: number
}

export const create = async (
  req: Request<Lab>,
  res: Response<Lab>
) => {
  let lab: Prisma.LabCreateInput
  lab = req.body
  await prisma.lab.create({ data: lab })
    .then((result) => {
      res.status(200);
      res.send(result);
    })
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Lab | null>,
) => {
  const id = parseInt(req.params.id);
  const lab = await prisma.lab.findUnique({
    where: {
      id: id
    }
  })
  res.status(200).send(lab);
}

export const readAll = async (
  req: Request<{}>,
  res: Response<Lab[] | null>,
) => {
  const lab = await prisma.lab.findMany()
  res.status(200).send(lab);
}

export const update = async (
  req: Request<Lab>,
  res: Response<Lab | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data = req.body
  const lab = await prisma.lab.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(lab);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.lab.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
