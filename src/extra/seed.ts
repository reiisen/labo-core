import { PrismaClient } from "@prisma/client";
import labData from "./init/lab.json"
import subjectData from "./init/subject.json"

const prisma = new PrismaClient();

async function seed() {
  const labs = await prisma.lab.findMany();
  const subjects = await prisma.subject.findMany();

  if (Object.keys(labs).length === 0) {
    await prisma.lab.createMany({
      data: labData
    });
  }

  if (Object.keys(subjects).length === 0) {
    await prisma.subject.createMany({
      data: subjectData
    });
  }
}

seed();


