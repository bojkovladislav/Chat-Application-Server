import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { usersController } from '../controllers/users.controller.js';

export const usersRouter = express.Router();

usersRouter.post('/', catchError(usersController.getUsersByMemberIds));
usersRouter.post('/friends', catchError(usersController.getFriends));
