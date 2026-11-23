const { MongoClient } = require('mongodb');
const config = require('../dbConfig.json');

const url =
  `mongodb+srv://${encodeURIComponent(config.userName)}:` +
  `${encodeURIComponent(config.password)}@${config.hostname}`;

const client = new MongoClient(url);
const db = client.db('rental');
const collection = db.collection('house');

async function main() {
  let insertedId;

  try {
    await db.command({ ping: 1 });
    console.log(`DB connected to ${config.hostname}`);

    const result = await collection.insertOne({
      name: 'CS 260 connection test',
      summary: 'Temporary test document',
      property_type: 'Condo',
      beds: 1,
    });
    insertedId = result.insertedId;
    console.log(`Inserted test document: ${insertedId}`);

    const saved = await collection.findOne({ _id: insertedId });
    console.log('Retrieved test document:', saved);
  } catch (err) {
    console.error('Database test failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (insertedId) {
      await collection.deleteOne({ _id: insertedId });
      console.log('Deleted the temporary test document');
    }
    await client.close();
  }
}

main();