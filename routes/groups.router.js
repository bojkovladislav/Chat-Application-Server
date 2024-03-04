import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { groupsController } from '../controllers/groups.controller.js';

export const groupsRouter = express.Router();

groupsRouter.post('/', catchError(groupsController.getFilteredGroups));
