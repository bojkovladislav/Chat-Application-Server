import ApiError from '../exceptions/api.error.js';
import CRUD from '../helpers/crudoperations.js';
import { usersServices } from './users.service.js';
import { messagesService } from './messages.service.js';
import admin from 'firebase-admin';

const crudGroups = new CRUD('Groups');

const createGroup = async (userId, newGroup) => {
  await usersServices.addNewRoomId(userId, newGroup.id);
  await messagesService.createMessages(newGroup.id);

  return crudGroups.create(newGroup, newGroup.id);
};

const getGroups = async (arrayOfIds) => {
  return crudGroups.getItemsByUserIds(arrayOfIds);
};

const getGroup = async (id) => {
  const group = await crudGroups.getById(id);

  if (!group._fieldsProto) {
    throw ApiError.notFound();
  }

  return group._fieldsProto;
};

const deleteGroupForSelf = async (userId, groupId) => {
  const user = await usersServices.getUserById(userId);

  if (!user) return 'user does not exist!';

  await removeMember(groupId, userId);

  return usersServices.removeRoomId(userId, groupId);
};

const deleteGroupForEveryone = async (userId, groupId) => {
  await deleteGroupForSelf(userId, groupId);
  await messagesService.deleteMessages(groupId);

  return crudGroups.delete(groupId);
};

const addMember = async (groupId, userId) => {
  return crudGroups.update(groupId, {
    members: admin.firestore.FieldValue.arrayUnion(userId),
  });
};

const removeMember = async (groupId, userId) => {
  return crudGroups.update(groupId, {
    members: admin.firestore.FieldValue.arrayRemove(userId),
  });
};

export const groupsService = {
  createGroup,
  getGroups,
  getGroup,
  deleteGroupForEveryone,
  deleteGroupForSelf,
  updateMembers: addMember,
  removeMember,
};
