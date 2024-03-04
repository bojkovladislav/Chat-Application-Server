import { messagesService } from '../services/messages.service.js';
import { v4 as uuid } from 'uuid';
import { privateRoomsService } from '../services/private.rooms.service.js';
import { createRoomForOpponent } from '../helpers/socketHelpers.js';
import { usersServices } from '../services/users.service.js';
import {
  generateNewPrivateRoom,
  generateOpponentRoom,
} from '../helpers/privateRoomsHelpers.js';
import { decrypt, encrypt } from '../helpers/encrypionHelpers.js';

function messagesEventHandler(socket) {
  socket.on('create_messages', async (roomId) => {
    try {
      await messagesService.createMessages(roomId);
    } catch (error) {
      throw new Error('Failed to create messages!');
    }
  });

  socket.on('get_messages', async (roomId) => {
    try {
      const encryptedMessages = await messagesService.getMessages(roomId);
      const decryptedMessages = {
        ...encryptedMessages,
        messages: encryptedMessages.messages.map((msg) => decrypt(msg)),
      };

      socket.emit('messages_got', decryptedMessages);
    } catch (error) {
      throw new Error('Failed to get messages!');
    }
  });

  socket.on(
    'create_message',
    async (room, author, content, date, repliedMessage) => {
      try {
        const newMessage = {
          id: uuid(),
          authorName: author.name,
          authorId: author.id,
          avatar: author.avatar,
          content,
          date,
          repliedMessage: repliedMessage || null,
        };

        const encryptedMessage = encrypt(newMessage);
        const decryptedMessage = decrypt(encryptedMessage);

        socket.emit('send_message', decryptedMessage);

        const isRoomPrivate = room.commonId !== undefined;
        const currentRoomId = isRoomPrivate ? room.commonId : room.id;

        if (isRoomPrivate) {
          await handlePrivateRooms(room, author);
        }

        await messagesService.createMessage(currentRoomId, encryptedMessage);

        socket.emit('message_created', decryptedMessage);
        socket.to(currentRoomId).emit('receive_message', decryptedMessage);
      } catch (error) {
        throw new Error('Failed to create message!');
      }
    }
  );

  async function handlePrivateRooms(room, author) {
    const existingMessages = await messagesService.findMessages(room.commonId);

    const sendOpponentRoomLocally = async (roomForOpponent, opponentUserId) => {
      try {
        const opponentUser = await usersServices.getUserById(opponentUserId);

        socket
          .to(opponentUser.socketId)
          .emit('send_private-room_to_opponent', roomForOpponent);
      } catch (error) {
        throw new Error('Failed to get the opponent user ID!');
      }
    };

    if (!existingMessages.exists) {
      try {
        const opponentUserId = room.creators.find(
          (creator) => creator !== author.id
        );
        const newPrivateRoom = generateNewPrivateRoom(
          room,
          author,
          opponentUserId
        );
        const roomForOpponent = generateOpponentRoom(newPrivateRoom, author);

        socket.join(room.commonId);

        await sendOpponentRoomLocally(roomForOpponent, opponentUserId);

        await Promise.all([
          createRoomForOpponent(roomForOpponent, socket, opponentUserId),
          privateRoomsService.createRoom(author.id, newPrivateRoom),
        ]);
      } catch (error) {
        throw new Error('Failed to create private rooms!');
      }
    }

    if (room.opponentRoomId) {
      try {
        await privateRoomsService.getRoom(room.opponentRoomId);
      } catch (error) {
        try {
          const opponentUserId = room.creators.find(
            (creator) => creator !== author.id
          );
          const roomForOpponent = generateOpponentRoom(room, author);

          await sendOpponentRoomLocally(roomForOpponent, opponentUserId);

          await createRoomForOpponent(roomForOpponent, socket, opponentUserId);
        } catch (error) {
          throw new Error('Error creating a room for opponent');
        }
      }
    }
  }

  socket.on('delete_message', async (currentRoomId, messageId) => {
    try {
      socket.to(currentRoomId).emit('receive_deleted_message-id', messageId);

      await messagesService.deleteMessage(currentRoomId, messageId);
    } catch (error) {
      throw new Error(`Unable to delete the message with id: ${messageId}`);
    }
  });

  socket.on(
    'update_message',
    async (currentRoomId, messageId, updatedContent) => {
      try {
        socket
          .to(currentRoomId)
          .emit('receive_updated_message', messageId, updatedContent);

        await messagesService.updateMessage(
          currentRoomId,
          messageId,
          updatedContent
        );
      } catch (error) {
        throw new Error(`Failed to update the message with id ${messageId}`);
      }
    }
  );
}

export const messagesSocket = {
  messagesEventHandler,
};
