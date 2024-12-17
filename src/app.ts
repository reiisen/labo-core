import express from 'express';
import setupRoute from './route/router'
import cors from 'cors';
import config from '../config.json';

const app = express();

app.use(express.json());
app.use(cors({ origin: `${process.env.VERCEL_URL ? process.env.VERCEL_URL : process.env.APP_URL}` }));

const port = process.env.PORT;

setupRoute(app);

app.listen(port, () => {
  console.clear();
  console.log(`
    🚀 Server ready at: http://localhost:${config.serverPort}
  `);
})
