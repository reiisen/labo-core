import type { Express } from "express";
import lab from "./routes/lab"
import subject from "./routes/subject"
import schedule from "./routes/schedule"

export default function setupRoute(app: Express) {
  app.get("/", (req, res) => {
    res.send("You are in the root!");
  })
  app.use('/lab', lab);
  app.use('/subject', subject);
  app.use('/schedule', schedule)
}
