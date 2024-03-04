import { db } from '../utility/db.js';

export default class CRUD {
  constructor(collectionName) {
    this.collection = db.collection(collectionName);
  }

  async create(data, id) {
    if (id) {
      const docRef = this.collection.doc(id);

      const existingDoc = await docRef.get();

      if (existingDoc.exists) {
        return existingDoc.data();
      }

      return docRef.set(data);
    }

    return this.collection.add(data);
  }

  getById(id) {
    const docRef = this.collection.doc(id);

    return docRef.get();
  }

  async getBy(propertyName, propertyValue) {
    let querySnapshot;
    const results = [];

    function getQuerySnapshot(name = propertyName, value = propertyValue) {
      return this.collection.where(name, '==', value).limit(1).get();
    }

    const boundGetQuerySnapShot = getQuerySnapshot.bind(this);

    if (Array.isArray(propertyValue)) {
      querySnapshot = await boundGetQuerySnapShot();

      if (querySnapshot.size === 0) {
        querySnapshot = await boundGetQuerySnapShot(
          propertyName,
          propertyValue.reverse()
        );
      }
    } else {
      querySnapshot = await boundGetQuerySnapShot();
    }

    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });

    return results;
  }

  async getItemsByUserIds(arrayOfIds) {
    const querySnapshot = await this.collection.get();
    const results = [];

    querySnapshot.forEach((doc) => {
      const documentData = doc.data();

      if (arrayOfIds.includes(documentData.id)) {
        results.push(documentData);
      }
    });

    return results;
  }

  async filterByName(name) {
    const querySnapshot = await this.collection.get();
    const results = [];

    querySnapshot.forEach((doc) => {
      const documentData = doc.data();
      const lowercaseName = documentData.name.toLowerCase();

      if (lowercaseName.includes(name.toLowerCase())) {
        results.push(documentData);
      }
    });

    return results;
  }

  async getAll() {
    const collectionSnapShot = await this.collection.get();
    const items = [];

    collectionSnapShot.forEach((doc) => {
      items.push(doc.data());
    });

    return items;
  }

  async getAllRooms(userRoomIds, withPublic = false) {
    const [groupsSnapShot, privateRoomsSnapShot] = await Promise.all([
      db
        .collection('Groups')
        .where('id', !userRoomIds.length ? 'array-contains' : 'in', userRoomIds)
        .get(),
      db
        .collection('PrivateRooms')
        .where('id', !userRoomIds.length ? 'array-contains' : 'in', userRoomIds)
        .get(),
    ]);

    const publicGroupsSnapShot = withPublic
      ? await db.collection('Groups').where('isPublic', '==', true).get()
      : null;

    const extractData = (snapshot) =>
      snapshot.docs.map((doc) => ({
        ...doc.data(),
        createTime: doc.createTime,
      }));

    const publicGroups =
      publicGroupsSnapShot !== null ? extractData(publicGroupsSnapShot) : [];

    const groupsData = extractData(groupsSnapShot).concat(publicGroups);

    const groups = groupsData.reduce((accumulator, currentGroup) => {
      const existingGroup = accumulator.find(
        (group) => group.id === currentGroup.id
      );

      if (!existingGroup) {
        accumulator.push(currentGroup);
      }

      return accumulator;
    }, []);

    const privateRooms = extractData(privateRoomsSnapShot);

    const allRooms = groups
      .concat(privateRooms)
      .sort(
        (room1, room2) => room2.createTime.seconds - room1.createTime.seconds
      );

    return allRooms;
  }

  update(id, data) {
    const docRef = this.collection.doc(id);

    return docRef.update(data);
  }

  delete(id) {
    const docRef = this.collection.doc(id);

    return docRef.delete();
  }
}
