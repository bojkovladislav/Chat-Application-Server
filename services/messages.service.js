import CRUD from '../helpers/crudoperations.js';
import admin from 'firebase-admin';

const crudMessages = new CRUD('Messages');

const findMessages = async (roomId) => {
  return crudMessages.getById(roomId);
};

const createMessage = async (roomId, newMessage) => {
  const foundRoom = await crudMessages.getById(roomId);

  if (!foundRoom._fieldsProto) {
    return crudMessages.create(
      {
        roomId,
        messages: [newMessage],
      },
      roomId
    );
  }

  return crudMessages.update(roomId, {
    messages: admin.firestore.FieldValue.arrayUnion(newMessage),
  });
};

const getMessages = async (roomId) => {
  const messagesDoc = await crudMessages.getById(roomId);

  if (!messagesDoc.exists) {
    return null;
  }

  return messagesDoc.data();
};

const createMessages = (roomId) => {
  const messages = {
    roomId,
    messages: [],
  };

  return crudMessages.create(messages, roomId);
};

const deleteMessages = (roomId) => {
  return crudMessages.delete(roomId);
};

const deleteMessage = async (roomId, messageId) => {
  const data = (await crudMessages.getById(roomId)).data();
  const { messages } = data;

  if (messages.some((message) => message.id === messageId)) {
    const updatedMessages = messages.filter(
      (message) => message.id !== messageId
    );

    await crudMessages.update(roomId, {
      messages: updatedMessages,
    });
  }
};

const updateMessage = async (roomId, messageId, updatedMessage) => {
  const data = (await crudMessages.getById(roomId)).data();
  const { messages } = data;

  const updatedMessages = messages.map((msg) => {
    if (msg.id === messageId) {
      return {
        ...msg,
        content: updatedMessage,
      };
    }

    return msg;
  });

  await crudMessages.update(roomId, {
    messages: updatedMessages,
  });
};

export const messagesService = {
  getMessages,
  createMessage,
  createMessages,
  deleteMessages,
  deleteMessage,
  updateMessage,
  findMessages,
};
