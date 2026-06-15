import express, { Router } from 'express';
import usersRouter from './module/users/users.router';

/* API ROUTER */
const apiRouter = Router();

apiRouter.use('/users', usersRouter);
/* TODO: if it gets to big move API ROUTER to it's own file */

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello World');
});

app.use('/api', apiRouter);

export default app;
