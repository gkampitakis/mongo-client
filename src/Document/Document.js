'use strict';

const { ObjectID } = require('mongodb');
const { MongoInstance } = require('../MongoInstance/MongoInstance');
const { stripObject } = require('../utils/utils');

class _Document extends MongoInstance {
  data;

  constructor (collectionName, data, schema) {
    super(collectionName, schema);

    this.data = data;

    this.prepareData(data);
  }

  remove = () => {
    return new Promise(async (resolve, reject) => {
      try {
        await this._schema?.executePreHooks('delete', stripObject(this), true);

        await this.collection.deleteOne({ _id: this.data._id });

        await this._schema?.executePostHooks('delete', stripObject(this), true);

        resolve(stripObject(this));
      } catch (error) {
        reject(error);
      }
    });
  };

  save = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        this.prepareData(this.data);

        await this._schema?.executePreHooks('save', stripObject(this), true);

        await this.collection.updateOne(
          {
            _id: this.data._id
          },
          { $set: this.data },
          { upsert: true }
        );

        await this._schema?.executePostHooks('save', stripObject(this), true);

        resolve(stripObject(this));
      } catch (error) {
        reject(error);
      }
    });
  };

  lean = () => {
    return this.data;
  };

  get schema () {
    return this._schema?.schemaDefinition;
  }

  prepareData (data) {
    const id = this.data._id || new ObjectID();
    if (this._schema) {
      this.data = this._schema.validate(data);
    }
    this.data._id = id;
  }
}

function Document (collectionName, data, schema) {
  return stripObject(new _Document(collectionName, data, schema));
}

module.exports = {
  Document
};
