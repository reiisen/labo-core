import { PrismaClient, Reserve } from "@prisma/client";
import { CronJob } from "cron";

const prisma = new PrismaClient();
export const jobs = new Map<number, [CronJob, CronJob]>();

export async function runStatusJob(request: Reserve): Promise<void> {
  const cronStart: string = "0 0 " + (request.timeslot + 7) + " * * " + (request.day + 1);
  const cronFinish: string = "0 0 " + (request.timeslot + 7 + request.length) + " * * " + (request.day + 1);
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
      process.stdout.write(`Done.\n Stopping the job.. `)
      startStatusJob.stop();
      process.stdout.write(`Done.\n`)
    }
  );

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
      process.stdout.write(`Done.\n Stopping and removing the rest.. `)
      finishStatusJob.stop();
      jobs.delete(request.id);
      process.stdout.write(`Done.\n`)
    }
  );

  jobs.set(request.id, [startStatusJob, finishStatusJob]);
  console.log(`Added job id ${request.id}`);
  startStatusJob.start();
  finishStatusJob.start();
  console.log(`Started job id ${request.id}`);
}

