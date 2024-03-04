import { usersServices } from '../services/users.service.js';
import { privateRoomsService } from '../services/private.rooms.service.js';

export async function createRoomForOpponent(
  roomForOpponent,
  socket,
  opponentId
) {
  try {
    const opponent = await usersServices.getUserById(opponentId);

    socket
      .to(opponent.socketId)
      .emit('send_private-room_for_opponent', roomForOpponent);

    try {
      await privateRoomsService.createRoom(opponentId, roomForOpponent);
    } catch (error) {
      console.log(error, 'error creating a room for opponent!');
    }

    socket
      .to(opponent.socketId)
      .emit('private-room_for_opponent_created', roomForOpponent);
  } catch (error) {
    console.log(error, 'failed to get the opponent!');
  }
}
