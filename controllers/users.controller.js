import ApiError from '../exceptions/api.error.js';
import { checkDefaultParams } from '../helpers/businessHelpers.js';
import CRUD from '../helpers/crudoperations.js';
import { usersServices } from '../services/users.service.js';

const getFilteredUsers = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    throw ApiError.badRequest('You need to provide a name!');
  }

  const filteredUsers = await usersServices.getFilteredUsers(name);

  res.send({
    message: "You've successfully received filtered users!",
    users: filteredUsers,
  });
};

const getUsersByMemberIds = async (req, res) => {
  const { memberIds } = req.body;

  checkDefaultParams({ memberIds });

  const members = await usersServices.getUsersByMemberIds(memberIds);

  res.send({
    groupMembers: members,
    message: 'Users by member ids have been successfully fetched!',
  });
};

const getFriends = async (req, res) => {
  const { arrayOfIds, currentUserId } = req.body;

  checkDefaultParams({ arrayOfIds, currentUserId });

  const allRooms = await new CRUD('Rooms').getAllRooms(arrayOfIds);

  const friends = allRooms
    .filter((room) => !room.members)
    .map((room) => {
      const opponentUserId = room.creators.find(
        (creator) => creator !== currentUserId
      );

      return { ...room, id: opponentUserId };
    });

  res.send({
    friends,
    message: "You've successfully received your friends!",
  });
};

export const usersController = {
  getFilteredUsers,
  getUsersByMemberIds,
  getFriends,
};
