import ApiError from '../exceptions/api.error.js';
import CRUD from '../helpers/crudoperations.js';
import { messagesService } from './messages.service.js';
import { usersServices } from './users.service.js';

const crudPrivateRooms = new CRUD('PrivateRooms');

const createRoom = async (userId, newRoom) => {
  const existingRoom = await crudPrivateRooms.create(newRoom, newRoom.id);

  if (existingRoom.name) {
    return existingRoom;
  }

  await usersServices.addNewRoomId(userId, newRoom.id);

  return null;
};

const getRooms = async (arrayOfIds) => {
  return crudPrivateRooms.getItemsByUserIds(arrayOfIds);
};

const getRoom = async (id) => {
  const room = await crudPrivateRooms.getById(id);

  if (!room._fieldsProto) {
    throw ApiError.notFound();
  }

  return room._fieldsProto;
};

const getRoomByCreators = async (creators) => {
  const rooms = await crudPrivateRooms.getBy('creators', creators);

  if (!rooms) return;

  return rooms[0];
};

const getFilteredRooms = async (currentUserName, userName) => {
  const filteredUsers = await new CRUD('Users').filterByName(userName);

  if (!filteredUsers.length) return [];

  return filteredUsers
    .filter((user) => user.name !== currentUserName)
    .map(({ name, id, avatar, status }) => ({
      name,
      id,
      creators: [id],
      avatar,
      status,
    }));
};

const deleteRoomForSelf = async (userId, roomId) => {
  const user = await usersServices.getUserById(userId);

  if (!user) return 'user does not exist!';

  return usersServices.removeRoomId(userId, roomId);
};

const deleteRoomForEveryone = async (userId, roomId) => {
  await deleteRoomForSelf(userId, roomId);
  await messagesService.deleteMessages(roomId);

  return crudPrivateRooms.delete(roomId);
};

export const privateRoomsService = {
  createRoom,
  getRooms,
  getRoom,
  getFilteredRooms,
  deleteRoomForEveryone,
  deleteRoomForSelf,
  getRoomByCreators,
};
