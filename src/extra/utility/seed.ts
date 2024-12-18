import { PrismaClient } from "@prisma/client";
import labData from "../init/lab.json"
import computerData from "../init/computer.json"
import roomData from "../init/room.json"

const prisma = new PrismaClient();

async function seed() {
  const labs = await prisma.lab.findMany();

  if (Object.keys(labs).length === 0) {
    await prisma.lab.createMany({
      data: labData
    });
  }

  const computers = await prisma.computer.findMany();

  if (Object.keys(computers).length === 0) {
    await prisma.computer.createMany({
      data: computerData
    });
  }

  const rooms = await prisma.room.findMany();

  if (Object.keys(rooms).length === 0) {
    await prisma.room.createMany({
      data: roomData
    });
  }
}

try {
  seed();
  console.log("Seeding complete");
} catch (e) {
  console.log("Failed to seed, see error\n\n" + e);
}


