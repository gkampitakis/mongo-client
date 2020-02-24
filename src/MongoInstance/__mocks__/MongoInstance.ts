import { Collection, Db } from 'mongodb';

export abstract class MongoInstance {
  public readonly _collectionName: string;
  public readonly schema: any;
  public static database: Db;

  public static UpdateOneSpy = jest.fn();
  public static FindOneAndUpdateSpy = jest.fn();
  public static DeleteManySpy = jest.fn();
  public static InsertOneSpy = jest.fn();
  public static FindOneSpy = jest.fn();
  public static DeleteOneSpy = jest.fn();
  public static SetDbSpy = jest.fn();

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

  static setDb(db: any) {
    MongoInstance.SetDbSpy(db);
  }

  get collection() {
    MongoInstance.GetCollectionSpy();

    return {
      updateOne: (query: any, data: any, options: any) => {
        MongoInstance.UpdateOneSpy(query, data, options);
        return MongoInstance.database.collection(this._collectionName).updateOne(query, data, options);
      },
      findOneAndUpdate: (query: any, data: any, options: any) => {
        MongoInstance.FindOneAndUpdateSpy(query, data, options);
        return MongoInstance.database.collection(this._collectionName).findOneAndUpdate(query, data, options);
      },
      deleteMany: (query: any) => {
        MongoInstance.DeleteManySpy(query);
        return MongoInstance.database.collection(this._collectionName).deleteMany(query);
      },
      insertOne: (data: any) => {
        MongoInstance.InsertOneSpy(data);
        return MongoInstance.database.collection(this._collectionName).insertOne(data);
      },
      findOne: (query: any) => {
        MongoInstance.FindOneSpy(query);
        return MongoInstance.database.collection(this._collectionName).findOne(query);
      },
      deleteOne: (query: any) => {
        MongoInstance.DeleteOneSpy(query);
        return MongoInstance.database.collection(this._collectionName).deleteOne(query);
      }
    };
  }
}
