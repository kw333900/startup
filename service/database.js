const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

if (!config.hostname || !config.userName || !config.password) {
  throw new Error('MongoDB configuration must include hostname, userName, and password');
}

const url = `mongodb+srv://${encodeURIComponent(config.userName)}:${encodeURIComponent(config.password)}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('tnratings');
const userCollection = db.collection('user');
const groupCollection = db.collection('group');

const defaultGroups = [
  { name: 'MyFam', members: ['seed-joe', 'seed-jill', 'seed-tim'] },
  { name: 'MyFriends', members: ['seed-sam', 'seed-ava'] },
  { name: 'MovieBuffs', members: ['seed-noah', 'seed-mia'] },
];

async function connect() {
  await client.connect();
  await db.command({ ping: 1 });
  await userCollection.createIndex({ email: 1 }, { unique: true });

  for (const group of defaultGroups) {
    await groupCollection.updateOne(
      { name: group.name },
      { $setOnInsert: group },
      { upsert: true }
    );
  }

  console.log(`DB connected to ${config.hostname}`);
}

async function findUser(field, value) {
  if (!value) return null;
  if (!['id', 'email', 'token'].includes(field)) {
    throw new Error('Unsupported user lookup field');
  }
  return userCollection.findOne({ [field]: value });
}

async function addUser(user) {
  await userCollection.insertOne(user);
  await groupCollection.updateMany(
    { name: { $in: ['MyFam', 'MyFriends'] } },
    { $addToSet: { members: user.id } }
  );
}

async function updateUserToken(userId, token) {
  await userCollection.updateOne({ id: userId }, { $set: { token } });
}

async function removeUserToken(userId) {
  await userCollection.updateOne({ id: userId }, { $unset: { token: '' } });
}

async function addRating(userId, rating) {
  await userCollection.updateOne({ id: userId }, { $push: { ratings: rating } });
  const user = await userCollection.findOne({ id: userId }, { projection: { ratings: 1 } });
  return user?.ratings ?? [];
}

async function updateCriteria(userId, criteria) {
  await userCollection.updateOne({ id: userId }, { $set: { criteria } });
  return criteria;
}

async function getGroupsForUser(userId) {
  return groupCollection.find({ members: userId }).toArray();
}

async function findGroupByName(name) {
  const groups = await groupCollection.find().toArray();
  const wanted = name.toLowerCase();
  return groups.find((group) => group.name.toLowerCase() === wanted) ?? null;
}

async function addGroupMember(groupName, userId) {
  await groupCollection.updateOne(
    { name: groupName },
    { $addToSet: { members: userId } }
  );
  return findGroupByName(groupName);
}

async function close() {
  await client.close();
}

module.exports = {
  addGroupMember,
  addRating,
  addUser,
  close,
  connect,
  findGroupByName,
  findUser,
  getGroupsForUser,
  removeUserToken,
  updateCriteria,
  updateUserToken,
};
