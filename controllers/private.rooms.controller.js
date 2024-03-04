import { checkDefaultParams } from '../helpers/businessHelpers.js';
import { privateRoomsService } from '../services/private.rooms.service.js';

const getFilteredRooms = async (req, res) => {
  const { currentUserName, name } = req.body;

  checkDefaultParams({ name, currentUserName });

  const filteredPrivateRooms = !name.length
    ? null
    : await privateRoomsService.getFilteredRooms(currentUserName, name);

  res.send({
    message: "You've successfully received filtered rooms",
    filteredPrivateRooms,
  });
};


export const privateRoomsController = {
  getFilteredRooms,
};
