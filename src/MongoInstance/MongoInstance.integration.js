'use strict';

const { MongoInstance } = require('./MongoInstance');
const mongodb = require('mongodb');
const { MONGO_URL } = require('../../setupTests');

class Test extends MongoInstance {
  constructor (collectionName, db) {
    if (db) MongoInstance.setDb(db);
    super(collectionName, {});
  }

  getCollectionTest () {
    return this.collection;
  }
}

describe('MongoInstance', () => {
  it('Should throw an error if the database is not initialized', () => {
    const test = new Test('testCollection');

    expect(() => test.getCollectionTest()).toThrowError('MongoClient not correctly initialized');
  });

  it('Should return the collection', async () => {
    const client = await mongodb.connect(MONGO_URL, { useUnifiedTopology: true });
    const testInstance = new Test('test', client.db('mock_db'));

    expect(() => testInstance.getCollectionTest()).not.toThrowError();
  });
});
