import { PrismaClient, Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const create = async (
  req: Request<Prisma.UserCreateInput>,
  res: Response<User>
) => {
  const user: Prisma.UserCreateInput = req.body;
  await prisma.user.create({ data: user })
    .then((result) => {
      res.status(200);
      res.send(result);
    })
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<User | null>,
) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.findUnique({
    where: {
      id: id
    }
  })
  if (user === null) {
    res.status(404).send();
  }
  res.status(200).send(user);
}

export const readAll = async (
  req: Request<{}>,
  res: Response<User[] | null>,
) => {
  const user = await prisma.user.findMany()
  res.status(200).send(user);
}

export const update = async (
  req: Request<User>,
  res: Response<User | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data = req.body
  const user = await prisma.user.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(user);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.user.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
