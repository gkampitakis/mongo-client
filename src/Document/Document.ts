/* eslint-disable @typescript-eslint/class-name-casing */
import { ObjectID } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';

/** @internal */
export class _Document extends MongoInstance {
  public document: any;

  public constructor(collectionName: string, doc: any, schema: Schema) {
    super(collectionName, schema);

    this.document = doc;
    this.schema.validate(doc);
  }

  get collectionName(): string {
    return this._collectionName;
  }

  public remove(): Promise<any> {
    const collection = _Document.database.collection(this.collectionName);

    return collection.deleteOne({ _id: new ObjectID(this.document._id) });
  }

  public save() {
    console.log('saving doc');
  }

  public lean(): void {
    console.log('leaning doc');
  }
}

/** @internal */
export function stripObject(document: _Document): Document {
  return {
    document: document.document,
    lean: document.lean,
    save: document.save,
    remove: document.remove,
    collectionName: document.collectionName
  };
}
//TODO: this overhead might be deleted in the future by making document simpler
export function Document(collectionName: string, document: any, schema: Schema): Document {
  return stripObject(new _Document(collectionName, document, schema));
}

export interface Document {
  document: any;
  lean: () => void;
  save: () => void;
  remove: () => Promise<any>;
  collectionName: string;
}
