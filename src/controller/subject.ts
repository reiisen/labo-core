import { PrismaClient, Prisma } from "@prisma/client";
import type { Subject } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();


export const create = async (
  req: Request<Prisma.SubjectCreateInput>,
  res: Response<Subject>
) => {
  const subject: Prisma.SubjectCreateInput = req.body;
  await prisma.subject.create({ data: subject })
    .then((result) => {
      res.status(200);
      res.send(result);
    })
}

export const readOne = async (
  req: Request<{ id: string }>,
  res: Response<Subject | null>,
) => {
  const id = parseInt(req.params.id);
  const subject = await prisma.subject.findUnique({
    where: {
      id: id
    }
  })
  if (subject === null) {
    res.status(404).send();
  }
  res.status(200).send(subject);
}

export const readAll = async (
  req: Request,
  res: Response<Subject[] | null>,
) => {
  const subject = await prisma.subject.findMany()
  res.status(200).send(subject);
}

export const read = async (
  req: Request<Partial<Omit<Subject, "id">> | Pick<Subject, "id">>,
  res: Response<Subject[]>
) => {
  const filter: Partial<Omit<Subject, "id">> | Pick<Subject, "id"> = req.body;
  try {
    const subject = await prisma.subject.findMany({
      where: filter
    });
    res.status(200).send(subject);
  } catch {
    res.status(400).send();
  }
}

export const update = async (
  req: Request<Subject>,
  res: Response<Subject | null>
) => {
  let id = req.params.id;
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  const data = req.body
  const subject = await prisma.subject.update({
    where: {
      id: id
    },
    data: data
  })
  res.status(200).send(subject);
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id);
  await prisma.subject.delete({
    where: {
      id: id
    }
  }).then(() => {
    res.status(200);
    res.send("OK");
  })
}
