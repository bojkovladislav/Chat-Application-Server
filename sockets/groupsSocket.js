import { v4 as uuid } from 'uuid';
import { groupsService } from '../services/groups.service.js';
import { handleGetRandomColor } from '../helpers/businessHelpers.js';
import { groupColors } from '../utility/constans.js';
import { usersServices } from '../services/users.service.js';

function handleGroupsEvent(socket) {
  socket.on('create_group', async (name, creators, memberIds, isPublic) => {
    try {
      const newGroup = {
        id: uuid(),
        name,
        avatar: handleGetRandomColor(groupColors),
        creators,
        members: memberIds,
        isPublic,
      };

      socket.emit('send_group', newGroup);

      for (const memberId of memberIds) {
        if (memberId !== creators[0]) {
          const user = await usersServices.getUserById(memberId);

          socket.to(user.socketId).emit('send_group', newGroup);
          socket.to(user.socketId).emit('group_created', newGroup);
        }
      }

      await groupsService.createGroup(memberIds, newGroup, socket);

      socket.emit('group_created', newGroup);
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create group! Please try again later!');
    }
  });

  socket.on('get_groups', async (arrayOfIds) => {
    try {
      const groups = await groupsService.getGroups(arrayOfIds);

      socket.emit('get_groups', groups);
    } catch (error) {
      throw new Error('Failed to get groups! Please try again later!');
    }
  });

  socket.on('delete_group', async (group, userId, forEveryone) => {
    try {
      if (forEveryone) {
        for (const memberId of group.members) {
          if (memberId !== group.creators[0]) {
            const user = await usersServices.getUserById(memberId);

            socket.to(user.socketId).emit('group_deleted', group.id);

            await groupsService.deleteGroupForSelf(memberId, group.id);
          }
        }

        await groupsService.deleteGroupForEveryone(userId, group.id);
      } else {
        await groupsService.deleteGroupForSelf(userId, group.id);
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to delete group! Try again later!');
    }
  });

  socket.on('update_group_members', async (groupId, userId) => {
    try {
      socket.to(groupId).emit('send_updated_group_members', userId);

      await groupsService.updateMembers(groupId, userId);
    } catch (error) {
      throw new Error('Failed to update group members!');
    }
  });
}

export const groupsSocket = {
  handleGroupsEvent,
};
