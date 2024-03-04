import { v4 as uuid } from 'uuid';
import { groupsService } from '../services/groups.service.js';
import { handleGetRandomColor } from '../helpers/businessHelpers.js';
import { groupColors } from '../utility/constans.js';

function handleGroupsEvent(socket) {
  socket.on(
    'create_group',
    async (name, creators, members, isPublic, userId) => {
      try {
        const newGroup = {
          id: uuid(),
          name,
          avatar: handleGetRandomColor(groupColors),
          creators,
          members,
          isPublic,
        };

        socket.emit('send_group', newGroup);

        await groupsService.createGroup(userId, newGroup);

        socket.emit('group_created', newGroup);
      } catch (error) {
        throw new Error('Failed to create group! Please try again later!');
      }
    }
  );

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
        await groupsService.deleteGroupForEveryone(userId, group.id);
      } else {
        await groupsService.deleteGroupForSelf(userId, group.id);
      }

      socket.emit('group_deleted', group.id);
    } catch (error) {
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
