import { PrismaClient, Reserve } from "@prisma/client";
import { CronJob } from "cron";

const prisma = new PrismaClient();

export async function runStatusJob(request: Reserve): Promise<void> {
  const cronStart: string = "0 0 " + (request.timeslot + 7) + " * * " + (request.day + 1);
  const duration = 1000 * 60 * 60 * request.length;
  const statusJob = new CronJob(
    cronStart,
    async () => {
      await prisma.reserve.update({
        where: {
          id: request.id
        },
        data: {
          status: "ACTIVE"
        }
      });

      setTimeout(async () => {
        await prisma.reserve.update({
          where: {
            id: request.id
          },
          data: {
            status: "CONCLUDED"
          }
        });
      }, duration);
    });

  statusJob.start();

  setTimeout(() => statusJob.stop(), duration + 500);
}

export async function runTestJob(request: Reserve): Promise<void> {
  const cronStart: string = "9 11 * * *";
  console.log("okee123");
  console.log(JSON.stringify(request))
  new CronJob(cronStart, async () => {
    console.log("doing");
    await prisma.reserve.update({
      where: {
        id: request.id
      },
      data: {
        status: "ACTIVE"
      }
    }).then((result) => {
      console.log("result rsulerefde: " + result);
    });
    console.log("done update ig")
  }).start();

  const cronFinish: string = "10 11 * * *";
  new CronJob(cronFinish, async () => {
    console.log("finishhh");
    await prisma.reserve.update({
      where: {
        id: request.id
      },
      data: {
        status: "CONCLUDED"
      }
    })
  }).start();
}
