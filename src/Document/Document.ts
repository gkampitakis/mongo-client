/* eslint-disable @typescript-eslint/class-name-casing */
import { ObjectID } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { stripObject } from '../Utils/Utils';

/** @internal */
class _Document extends MongoInstance {
  public data: any;

  public constructor(collectionName: string, data: any, schema?: Schema) {
    super(collectionName, schema);

    this.data = data;

    if (schema) this.beforeStep(data);
  }

  public remove = (): Promise<{}> => {
    return new Promise(async (resolve, reject) => {
      try {
        await this.collection.deleteOne({ _id: new ObjectID(this.data._id) });

        resolve(stripObject(this));
      } catch (error) {
        reject(error);
      }
    });
  };

  public save = async (): Promise<{}> => {
    this.data._id = this.data._id || new ObjectID();

    return new Promise(async (resolve, reject) => {
      try {
        if (this.schema) this.beforeStep(this.data);

        await this.collection.updateOne(
          {
            _id: this.data._id
          },
          { $set: this.data },
          { upsert: true }
        );

        resolve(stripObject(this));
      } catch (error) {
        reject(error);
      }
    });
  };

  public lean = () => {
    return this.data;
  };

  private beforeStep(data: any) {
    this.data = this.schema!.sanitizeData(data);
    this.schema!.isValid(data);
  }
}

/** @internal */
export function Document<Generic>(collectionName: string, data: Generic, schema?: Schema): Document<Generic> {
  return stripObject(new _Document(collectionName, data, schema));
}

export type Document<data = any> = {
  data: { _id?: string } & data;
  lean: () => { _id?: string } & data;
  save: () => void;
  remove: () => Promise<any>;
  collectionName: string;
};
