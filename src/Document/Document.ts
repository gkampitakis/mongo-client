/* eslint-disable @typescript-eslint/class-name-casing */
import { ObjectID } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';

/** @internal */
export class _Document extends MongoInstance {
  public data: any;

  public constructor(collectionName: string, data: any, schema: Schema) {
    super(collectionName, schema);

    this.data = data;
    this.schema.validate(data);
  }

  get collectionName(): string {
    return this._collectionName;
  }

  public remove(): Promise<any> {
    const collection = _Document.database.collection(this.collectionName);

    return collection.deleteOne({ _id: new ObjectID(this.data._id) });
  }

  public async save(): Promise<any> {

    const collection = _Document.database.collection(this.collectionName);

    this.data._id = this.data._id || new ObjectID();

    //TODO: validation here on the document passed ignore _id and __v 

    return await collection.updateOne({
      _id: new ObjectID(this.data._id)
    }, { $set: this.data }, { upsert: true });

  }

  public lean() {

    return this.data;

  }

}

/** @internal */
export function stripObject(document: _Document): Document {
  return {
    data: document.data,
    lean: document.lean,
    save: document.save,
    remove: document.remove,
    collectionName: document.collectionName
  };
}
//TODO: this overhead might be deleted in the future by making document simpler
export function Document(collectionName: string, data: any, schema: Schema): Document {
  return stripObject(new _Document(collectionName, data, schema));
}

export interface Document<data = any> {
  data: data;
  lean: () => data;
  save: () => void;
  remove: () => Promise<any>;
  collectionName: string;
}
