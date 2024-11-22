import { PrismaClient } from "@prisma/client";
import labData from "../init/lab.json"

const prisma = new PrismaClient();

async function seed() {
  const labs = await prisma.lab.findMany();

  if (Object.keys(labs).length === 0) {
    await prisma.lab.createMany({
      data: labData
    });
  }
}

try {
  seed();
  console.log("Seeding complete");
} catch (e) {
  console.log("Failed to seed, see error\n\n" + e);
}


