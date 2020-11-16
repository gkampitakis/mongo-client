'use strict';

const { extractUniqueValues, objectEquality, objectID } = require('../utils/utils');
const { MongoInstance } = require('../MongoInstance/MongoInstance');
const { Document } = require('../Document/Document');

class InternalModel extends MongoInstance {
  constructor (collectionName, schema) {
    super(collectionName, schema);
    if (schema?.schemaDefinition) this.prepareCollection(collectionName, schema.schemaDefinition);
  }

  findOne (query, options = { lean: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        const { lean, ...rest } = options;
        const result = await this.collection.findOne(query, rest);

        if (!result) return resolve(null);

        if (lean) return resolve(result);

        const wrappedDoc = Document(this.collectionName, result, this._schema);

        resolve(wrappedDoc);
      } catch (error) {
        reject(error);
      }
    });
  }

  findById (id, options) {
    return this.findOne({ _id: id }, options);
  }

  findByIdAndDelete (id, options) {
    return this.deleteOne({ _id: id }, options);
  }

  findByIdAndUpdate (id, update, lean = false) {
    return this.updateOne({ _id: id }, update, lean);
  }

  find (filter, options) {
    return this.collection.find(filter, options);
  }

  updateOne (filter, update, lean = false) {
    return new Promise(async (resolve, reject) => {
      try {
        const document = await this.findOne(filter, { lean: true });

        if (!document) return resolve(null);

        const updatedData = { ...document, ...update };

        this._schema?.validate(updatedData);

        if (objectEquality(document, updatedData)) return resolve(document);

        let wrappedDoc = lean ? document : Document(this.collectionName, document, this._schema);

        await this._schema?.executePreHooks('update', wrappedDoc, lean);

        await this.collection.updateOne(filter, { $set: update });

        if (lean) {
          wrappedDoc = { ...wrappedDoc, ...update };
        } else {
          wrappedDoc.data = { ...wrappedDoc.data, ...update };
        }

        await this._schema?.executePostHooks('update', wrappedDoc, lean);

        resolve(wrappedDoc);
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteMany (filter, options) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.collection.deleteMany(filter, options);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteOne (filter, options) {
    if (this._schema?.hasPreHooks || this._schema?.hasPostHooks) return this.deleteOneWithHooks(filter, options);
    return this.deleteOneWithoutHooks(filter, options);
  }

  deleteOneWithHooks (filter, options = { lean: false }) {
    return new Promise(async (resolve) => {
      const document = await this.collection.findOne(filter),
        { lean, ...rest } = options;

      if (!document) return resolve(null);

      const wrappedDoc = options?.lean ? document : Document(this.collectionName, document, this._schema);

      await this._schema?.executePreHooks('delete', wrappedDoc, lean);

      const result = this.collection.deleteOne(filter, rest);

      await this._schema?.executePostHooks('delete', wrappedDoc, lean);

      resolve(result);
    });
  }

  deleteOneWithoutHooks (filter, options = { lean: false }) {
    const { lean, ...rest } = options;
    return this.collection.deleteOne(filter, rest);
  }

  instance (data) {
    return Document(this.collectionName, data, this._schema);
  }

  create (data, options = { lean: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        let wrappedDoc;

        const { lean, ...rest } = options;

        if (lean) {
          wrappedDoc = data;
          wrappedDoc._id = objectID();
        } else {
          wrappedDoc = Document(this.collectionName, data, this._schema);
        }

        await this._schema?.executePreHooks('create', wrappedDoc, lean);

        await this.collection.insertOne(lean ? wrappedDoc : wrappedDoc.data, rest);

        await this._schema?.executePostHooks('create', wrappedDoc, lean);

        resolve(wrappedDoc);
      } catch (error) {
        reject(error);
      }
    });
  }

  async prepareCollection (collectionName, schemaDefinition) {
    const collectionExists = await this.collectionExists(collectionName);

    if (collectionExists) return;

    const values = extractUniqueValues(schemaDefinition);

    for (const value of values) {
      this.collection.createIndex(value, { unique: true, sparse: true });
    }
  }

  async collectionExists (collectionName) {
    if (!InternalModel.database) await this.checkConnection();
    return await InternalModel.database.listCollections({ name: collectionName }).hasNext();
  }

  checkConnection () {
    return new Promise((resolve) => {
      let retries = 0;
      const timer = setInterval(() => {
        retries++;
        if (InternalModel.database) {
          resolve(true);
          clearInterval(timer);
        }
        if (retries === 30) {
          clearInterval(timer);
        }
      }, 1005);
    });
  }
}

function Model (collectionName, schema) {
  return new InternalModel(collectionName, schema);
}

module.exports = {
  Model
};
