import { v4 as uuid } from 'uuid';

export function generateNewPrivateRoom(room, author, opponentUserId) {
  return {
    id: uuid(),
    commonId: room.commonId,
    opponentRoomId: uuid(),
    name: room.name,
    avatar: room.avatar,
    status: room.status,
    creators: [author.id, opponentUserId],
  };
}

export function generateOpponentRoom(currentRoom, author) {
  return {
    ...currentRoom,
    id: currentRoom.opponentRoomId,
    opponentRoomId: currentRoom.id,
    name: author.name,
    avatar: author.avatar,
    status: author.status,
  };
}
