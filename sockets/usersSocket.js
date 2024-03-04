import { usersServices } from '../services/users.service.js';
import { v4 as uuid } from 'uuid';
import { handleGetRandomColor } from '../helpers/businessHelpers.js';
import { userColors } from '../utility/constans.js';

function handleUserEvents(socket) {
  socket.on('create_user', async (name) => {
    try {
      const existingUser = await usersServices.getUserByName(name.trim());

      if (existingUser) {
        socket.emit('user_exists', existingUser);
        await usersServices.update(existingUser.id, 'status', 'online');

        return;
      }

      const newUser = {
        id: uuid(),
        socketId: socket.id,
        name,
        rooms: [],
        avatar: handleGetRandomColor(userColors),
        status: 'online',
      };

      await usersServices.createUser(newUser);

      socket.emit('user_created', newUser);
    } catch (error) {
      throw new Error('Failed to create user! Please try again later!');
    }
  });

  socket.on('get_user', async (id) => {
    try {
      await usersServices.update(id, 'socketId', socket.id);
      await usersServices.update(id, 'status', 'online');

      const user = await usersServices.getUserById(id);

      socket.emit('user_got', user);
    } catch (error) {
      throw new Error('Failed to get user!');
    }
  });

  socket.on('user_disconnect', async (id) => {
    try {
      if (id) {
        await usersServices.update(id, 'status', 'offline');
      }
    } catch (error) {
      throw new Error('Failed to update user status!');
    }
  });

  socket.on('user_update_roomIds', async (id, roomId) => {
    try {
      await usersServices.addNewRoomId(id, roomId);
    } catch (error) {
      throw new Error('Failed to update user roomIds!');
    }
  });

  socket.on('user_update_field', async (id, field, newValue) => {
    try {
      await usersServices.update(id, field, newValue);
    } catch (error) {
      throw new Error(`Failed to update user ${field}!`);
    }
  });
  console.log('Joined');
}

export const usersSocket = {
  handleUserEvents,
};
