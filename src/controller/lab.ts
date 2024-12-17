import { PrismaClient, Prisma } from "@prisma/client";
import type { Lab } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const create = async (
  req: Request<Omit<Lab, 'id'>>,
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

export const read = async (
  req: Request<Partial<Omit<Lab, "id">> | Pick<Lab, "id">>,
  res: Response<Lab[]>
) => {
  const filter: Partial<Omit<Lab, "id">> | Pick<Lab, "id"> = req.body;
  try {
    const lab = await prisma.lab.findMany({
      where: filter
    });
    res.status(200).send(lab);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Lab>,
  res: Response<Lab | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data: Lab = req.body;
  data.updatedAt = new Date();
  const lab = await prisma.lab.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(lab);
}

export const toggleInactive = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  const check = await prisma.lab.findUnique({
    where: {
      id: id
    },
    select: {
      inactive: true
    }
  });
  try {
    await prisma.lab.update({
      where: {
        id: id
      },
      data: {
        inactive: check ? check.inactive ? false : true : false
      }
    }).then(() => {
      res.status(200);
      res.send("OK");
      return;
    })
  } catch {
    console.log("error, maybe wrong id?");
    return;
  }
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
    return;
  })
}
