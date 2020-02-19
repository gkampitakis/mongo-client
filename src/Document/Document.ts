/* eslint-disable @typescript-eslint/class-name-casing */
import { ObjectID } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';

/** @internal */
export class _Document<Generic extends { _id?: string | ObjectID } = any> extends MongoInstance {
  public data: Generic;

  public constructor(collectionName: string, data: Generic, schema: Schema) {
    super(collectionName, schema);

    this.data = data;
    this.schema.validate(data);
  }

  public remove = (): Promise<{}> => {

    return this.collection.deleteOne({ _id: new ObjectID(this.data._id) });

  }

  public save = async (): Promise<{}> => {

    this.data._id = this.data._id || new ObjectID();

    //TODO: validation here on the document passed ignore _id and __v 

    return await this.collection.updateOne({
      _id: new ObjectID(this.data._id)
    }, { $set: this.data }, { upsert: true });

  }

  public lean = (): Generic => {

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
export function Document<Generic>(collectionName: string, data: Generic, schema: Schema): Document<Generic> {
  return stripObject(new _Document<Generic>(collectionName, data, schema));
}

export interface Document<data = any> {
  data: { _id?: string } & data;
  lean: () => data;
  save: () => void;
  remove: () => Promise<any>;
  collectionName: string;
}