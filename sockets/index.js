import { usersServices } from '../services/users.service.js';
import { groupsSocket } from './groupsSocket.js';
import { messagesSocket } from './messagesSocket.js';
import { privateRoomsSocket } from './privateRoomsSocket.js';
import { roomsSocket } from './roomsSocket.js';
import { usersSocket } from './usersSocket.js';

export function initializeWebSocket(io) {
  io.on('connection', (socket) => {
    usersSocket.handleUserEvents(socket);
    roomsSocket.handleRoomsEvent(socket);
    groupsSocket.handleGroupsEvent(socket);
    messagesSocket.messagesEventHandler(socket);
    privateRoomsSocket.handlePrivateRoomsEvents(socket);

    socket.on('join_room', (id) => {
      try {
        socket.join(id);
      } catch (error) {
        throw new Error(`Failed to join a room with id - ${id}!`);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const disconnectedUser = await usersServices.getUserBySocketId(
          socket.id
        );

        if (disconnectedUser) {
          await usersServices.update(disconnectedUser.id, 'status', 'offline');
        }
      } catch (error) {
        throw new Error('Failed to disconnect!');
      }
    });

    socket.on('typing_trigger', (userName, roomId) => {
      try {
        socket.to(roomId).emit('typing_receive', userName);
      } catch (error) {
        throw new Error('Failed to receive a typing status!');
      }
    });
  });
}
