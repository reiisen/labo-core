import { PrismaClient, Reserve } from "@prisma/client";
import { CronJob } from "cron";

const prisma = new PrismaClient();
export const jobs = new Map<number, [CronJob, CronJob] | [CronJob]>();

export async function runStatusJob(request: Reserve, instant?: boolean): Promise<void> {
  const cronStart: string = "0 0 " + request.date.getHours() + " * * " + (request.date.getDay());
  const cronFinish: string = "0 0 " + (request.date.getHours() + request.length) + " * * " + (request.date.getDay());
  if (!instant) {
    const startStatusJob = new CronJob(
      cronStart,
      async () => {
        process.stdout.write(`Changing reservation ${request.id} status to ACTIVE.. `);
        await prisma.reserve.update({
          where: {
            id: request.id
          },
          data: {
            status: "ACTIVE"
          }
        });
        process.stdout.write(`Done.\n Stopping the starter job.. `)
        startStatusJob.stop();
        process.stdout.write(`Done.\n`)
      }
    );
    startStatusJob.start();

    const finishStatusJob = new CronJob(
      cronFinish,
      async () => {
        process.stdout.write(`Changing reservation ${request.id} status to CONCLUDED.. `);
        await prisma.reserve.update({
          where: {
            id: request.id
          },
          data: {
            status: "CONCLUDED"
          }
        });
        process.stdout.write(`Done.\n Stopping the finish job and removing the rest.. `)
        finishStatusJob.stop();
        jobs.delete(request.id);
        process.stdout.write(`Done.\n`)
      }
    );
    finishStatusJob.start();
    jobs.set(request.id, [startStatusJob, finishStatusJob]);
  } else {
    const finishStatusJob = new CronJob(
      cronFinish,
      async () => {
        process.stdout.write(`Changing reservation ${request.id} status to CONCLUDED.. `);
        await prisma.reserve.update({
          where: {
            id: request.id
          },
          data: {
            status: "CONCLUDED"
          }
        });
        process.stdout.write(`Done.\n Stopping the finish job and removing the rest.. `)
        finishStatusJob.stop();
        jobs.delete(request.id);
        process.stdout.write(`Done.\n`)
      }
    );
    finishStatusJob.start();
    jobs.set(request.id, [finishStatusJob]);
  }


  console.log(`Added job id ${request.id}`);
  console.log(`Started job id ${request.id}`);
}

