import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { messagesController } from '../controllers/messages.controller.js';

export const messagesRouter = express.Router();

messagesRouter.post('/:roomId', catchError(messagesController.createMessage));
messagesRouter.get('/:roomId', catchError(messagesController.getMessages));
