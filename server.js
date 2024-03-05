import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { initializeWebSocket } from './sockets/index.js';
import { errorMiddleware } from './middlewares/errorMiddleWare.js';
import { privateRoomsRouter } from './routes/private.rooms.router.js';
import { groupsRouter } from './routes/groups.router.js';
import { roomsRouter } from './routes/rooms.router.js';
import { usersRouter } from './routes/users.router.js';
import 'dotenv/config';

const { PORT, ORIGIN } = process.env;

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'X-Requested-With',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  },
});

app.use(express.json());

app.use('/private-rooms', privateRoomsRouter);
app.use('/groups', groupsRouter);
app.use('/rooms', roomsRouter);
app.use('/users', usersRouter);
app.use(errorMiddleware);

initializeWebSocket(io);
server.listen(PORT);
