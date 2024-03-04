import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { privateRoomsController } from '../controllers/private.rooms.controller.js';

export const privateRoomsRouter = express.Router();

privateRoomsRouter.post(
  '/',
  catchError(privateRoomsController.getFilteredRooms)
);
