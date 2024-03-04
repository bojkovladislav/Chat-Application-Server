import CRUD from '../helpers/crudOperations.js';

function handleRoomsEvent(socket) {
  socket.on('get_rooms', async (arrayOfIds, typeOfRooms = 'all') => {
    try {
      const roomsCrud = new CRUD('Rooms');
      let rooms = !!arrayOfIds.length
        ? await roomsCrud.getAllRooms(arrayOfIds)
        : [];

      if (typeOfRooms !== 'all') {
        rooms = rooms.filter((room) =>
          typeOfRooms === 'private' ? !room.members : room.members
        );
      }

      socket.emit('rooms_got', rooms);
    } catch (error) {
      throw new Error('Failed to get rooms! Try again later!');
    }
  });
}

export const roomsSocket = {
  handleRoomsEvent,
};
