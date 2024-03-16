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
        description: '',
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

  socket.on('add_members', async (group, membersToAdd) => {
    try {
      for (const member of membersToAdd) {
        const user = await usersServices.getUserById(member);

        socket.to(user.socketId).emit('send_group', group);
        socket.to(user.socketId).emit('group_created', group);
        socket.emit('send_updated_group_members', group.id, member);
        socket
          .to(group.id)
          .emit('send_updated_group_members', group.id, member);

        await groupsService.updateMembers(group.id, member);
        await usersServices.addNewRoomId(member, group.id);
      }
    } catch (error) {
      throw new Error('Failed to add members!');
    }
  });

  socket.on(
    'update_group_credentials',
    async (id, memberIds, originalGroupCred, changedGroupCred) => {
      try {
        const updatedCredentials = {
          id,
        };

        for (const key in originalGroupCred) {
          const updatedValue =
            typeof changedGroupCred !== 'string'
              ? changedGroupCred[key]
              : changedGroupCred[key].trim();

          updatedCredentials[key] = updatedValue;

          if (originalGroupCred[key] !== updatedValue) {
            await groupsService.updateField(id, key, updatedValue);
          }
        }

        socket.emit('group_credentials_updated', updatedCredentials);

        for (const memberId of memberIds) {
          const user = await usersServices.getUserById(memberId);

          socket
            .to(user.socketId)
            .emit('group_credentials_updated', updatedCredentials);
        }
      } catch (error) {
        throw new Error("Failed to update group's credentials!");
      }
    }
  );

  socket.on('remove_member', async (groupId, memberId) => {
    try {
      const user = await usersServices.getUserById(memberId);

      socket.emit('member_removed', groupId, memberId);
      socket.to(groupId).emit('member_removed', groupId, memberId);
      socket.to(user.socketId).emit('group_deleted', groupId);

      await groupsService.removeMember(groupId, memberId);
      await usersServices.removeRoomId(memberId, groupId);
    } catch (error) {
      throw new Error('Failed to remove a member!');
    }
  });
}

export const groupsSocket = {
  handleGroupsEvent,
};
