import express from 'express';
import setupRoute from './route/router'
import cors from 'cors';
import config from '../config.json';

const app = express();

app.use(express.json());
app.use(cors({ origin: `http://localhost:3000` }));

const port = process.env.PORT;

setupRoute(app);

app.listen(port, () => {
  console.clear();
  console.log(`
    🚀 Server ready at: http://localhost:${config.serverPort}

       いつまでもあきらめないで元気になれ
       時は時々残酷ようなものだが
       そのものの経過にいつもいつも流れさえすれば
       あなたの時代はまだ終わっていません
  `);
})
