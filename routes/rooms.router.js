import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { checkDefaultParams } from '../helpers/businessHelpers.js';
import CRUD from '../helpers/crudoperations.js';

export const roomsRouter = express.Router();

roomsRouter.post(
  '/',
  catchError(async (req, res) => {
    const { arrayOfIds, name } = req.body;

    checkDefaultParams({ arrayOfIds, name });

    const rooms = await new CRUD('Rooms').getAllRooms(arrayOfIds, true);

    const filteredRooms = !name.length
      ? null
      : rooms.filter((room) =>
          room.name.toLowerCase().includes(name.toLowerCase())
        );

    res.send({
      message: "You've successfully fetched rooms",
      filteredRooms,
    });
  })
);
