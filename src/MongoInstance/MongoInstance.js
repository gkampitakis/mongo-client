'use strict';

class MongoInstance {
  _collectionName;
  _schema;
  static database;

  constructor (collectionName, schema) {
    this._collectionName = collectionName;
    this._schema = schema;
  }

  get collectionName () {
    return this._collectionName;
  }

  get collection () {
    if (!MongoInstance.database) throw new Error('MongoClient not correctly initialized');

    return MongoInstance.database.collection(this._collectionName);
  }

  // get database () { // TODO:



  // }

  static setDb (db) {
    if (!MongoInstance.database) MongoInstance.database = db;
  }
}

module.exports = {
  MongoInstance
};
