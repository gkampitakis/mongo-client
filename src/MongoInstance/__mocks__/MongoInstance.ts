import { Collection, Db } from 'mongodb';

export abstract class MongoInstance {
  public readonly _collectionName: string;
  public readonly schema: any;
  public static database: Db;

  public static GetCollectionNameSpy = jest.fn();
  public static GetCollectionSpy = jest.fn();

  public constructor(collectionName: string, schema: any) {
    this._collectionName = collectionName;
    this.schema = schema;
  }

  get collectionName(): string {
    MongoInstance.GetCollectionNameSpy();
    return this._collectionName;
  }

  get collection(): Collection {
    MongoInstance.GetCollectionSpy();

    return MongoInstance.database.collection(this._collectionName);
  }
}
