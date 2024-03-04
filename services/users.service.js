import CRUD from '../helpers/crudoperations.js';
import ApiError from '../exceptions/api.error.js';
import admin from 'firebase-admin';

const usersCrud = new CRUD('Users');

const createUser = (newUser) => {
  return usersCrud.create(newUser, newUser.id);
};

const getUsers = () => {
  return usersCrud.getAll();
};

const getUserByName = async (name) => {
  const users = await usersCrud.getBy('name', name);

  return users[0];
};

const getUserBySocketId = async (socketId) => {
  const users = await usersCrud.getBy('socketId', socketId);

  return users[0] || null;
};

const getUserById = async (id) => {
  const foundUserDoc = await usersCrud.getById(id);

  if (!foundUserDoc.exists) {
    throw ApiError.notFound();
  }

  return foundUserDoc.data();
};

const addNewRoomId = async (id, newRoomId) => {
  return usersCrud.update(id, {
    rooms: admin.firestore.FieldValue.arrayUnion(newRoomId),
  });
};

const removeRoomId = (id, roomId) => {
  return usersCrud.update(id, {
    rooms: admin.firestore.FieldValue.arrayRemove(roomId),
  });
};

const getFilteredUsers = (name) => {
  return usersCrud.getBy('name', name);
};

const update = (id, field, newValue) => {
  return usersCrud.update(id, { [field]: newValue });
};

const getUsersByMemberIds = async (memberIds) => {
  const users = await usersCrud.getItemsByUserIds(memberIds);

  const usersConvertedToPrivateRooms = users.map(
    ({ name, id, avatar, status }) => ({
      name,
      id,
      creators: [id],
      avatar,
      status,
    })
  );

  return usersConvertedToPrivateRooms;
};

export const usersServices = {
  createUser,
  getUsersByMemberIds,
  getUsers,
  getUserById,
  getUserByName,
  addNewRoomId,
  removeRoomId,
  getFilteredUsers,
  getUserBySocketId,
  update,
};
