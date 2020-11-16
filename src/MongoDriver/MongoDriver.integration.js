'use strict';

const { MongoClient } = require('./MongoDriver');
const { MONGO_URL } = require('../../setupTests');

describe('MongoClient', () => {
  describe('Method connect', () => {
    it('Should setDb instance', async () => {
      await MongoClient.connect(MONGO_URL, 'mock_db');

      expect(MongoClient.db).not.toBeUndefined();
    });

    it('should retrieve same instance', () => {
      const { MongoClient } = require('./MongoDriver');

      expect(MongoClient.db.databaseName).toBe('mock_db');
    });
  });
});
