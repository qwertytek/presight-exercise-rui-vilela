import express, { Router } from 'express';
import cors from 'cors';
import usersRouter from './module/users/users.router';

/* API ROUTER */
const apiRouter = Router();

apiRouter.use('/users', usersRouter);
/* TODO: if it gets to big move API ROUTER to it's own file */

const app = express();
app.use(
  cors({
    /* in production replace with env variables */
    origin: ['http://localhost:5173', 'http://192.168.160.2:5173/'],
    credentials: true,
  }),
);

app.use('/api', apiRouter);

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello World');
});

export default app;
