import express from 'express';
import setupRoute from './route/router'

const app = express();

app.use(express.json())

const port = process.env.PORT;

setupRoute(app);

app.listen(port, () => {
  console.log(`
    🚀 Server ready at: http://localhost:${port}

    ⭐️ いつまでもあきらめないで元気になれ
       時は時々残酷ようなものだが
       そのものの経過にいつもいつも流れさえすれば
       あなたの時代はまだ終わっていません
  `)
})
