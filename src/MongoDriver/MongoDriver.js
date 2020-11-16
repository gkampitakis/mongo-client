'use strict';

const mongodb = require('mongodb');
const { MongoInstance } = require('../MongoInstance/MongoInstance');

class _MongoDriver {
  db;
  client;
  static instance;

  static getInstance () {
    if (!_MongoDriver.instance) {
      _MongoDriver.instance = new _MongoDriver();
    }

    return _MongoDriver.instance;
  }

  connect (uri, database, options) {
    return mongodb.connect(uri, options).then(async (client) => {
      this.db = client.db(database);
      this.client = client;

      MongoInstance.setDb(this.db);
    });
  }
}

const MongoClient = _MongoDriver.getInstance();

module.exports = {
  MongoClient
};
