import type { Express } from "express";
import lab from "./routes/lab"
import subject from "./routes/subject"
import course from "./routes/course"
import reserve from "./routes/reserve"
import config from "./routes/config"
// import user from "./routes/user"

export default function setupRoute(app: Express) {
  app.get("/", (req, res) => { res.send("this is the root lol"); })
  app.use('/lab', lab);
  app.use('/subject', subject);
  app.use('/course', course);
  app.use('/reserve', reserve);
  app.use('/config', config);
  // app.use('/user', user)
}
