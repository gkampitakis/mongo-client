import { Collection, Db } from 'mongodb';

export abstract class MongoInstance {
	public readonly _collectionName: string;
	public readonly _schema: any;
	public static database: Db;

	public static UpdateOneSpy = jest.fn();
	public static FindOneAndUpdateSpy = jest.fn();
	public static DeleteManySpy = jest.fn();
	public static InsertOneSpy = jest.fn();
	public static FindOneSpy = jest.fn();
	public static DeleteOneSpy = jest.fn();
	public static SetDbSpy = jest.fn();
	public static CreateIndexSpy = jest.fn();
	public static FindSpy = jest.fn();

	public static GetCollectionNameSpy = jest.fn();
	public static GetCollectionSpy = jest.fn();

	public static throwError = false;

	public constructor(collectionName: string, schema: any) {
		this._collectionName = collectionName;
		this._schema = schema;
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
				MongoInstance.UpdateOneSpy(...arguments);
				if (MongoInstance.throwError) throw new Error('MockError');

				return MongoInstance.database.collection(this._collectionName).updateOne(query, data, options);
			},
			findOneAndUpdate: (query: any, data: any, options: any) => {
				MongoInstance.FindOneAndUpdateSpy(query, data, options);
				return MongoInstance.database.collection(this._collectionName).findOneAndUpdate(query, data, options);
			},
			deleteMany: (query: any) => {
				MongoInstance.DeleteManySpy(query);
				if (MongoInstance.throwError) throw new Error('MockError');
				return MongoInstance.database.collection(this._collectionName).deleteMany(query);
			},
			insertOne: (data: any) => {
				MongoInstance.InsertOneSpy(data);
				if (MongoInstance.throwError) throw new Error('MockError');
				return MongoInstance.database.collection(this._collectionName).insertOne(data);
			},
			findOne: (query: any) => {
				MongoInstance.FindOneSpy(query);

				if (MongoInstance.throwError) throw new Error('MockError');

				return MongoInstance.database.collection(this._collectionName).findOne(query);
			},
			deleteOne: (query: any) => {
				MongoInstance.DeleteOneSpy(query);
				if (MongoInstance.throwError) throw new Error('MockError');

				return MongoInstance.database.collection(this._collectionName).deleteOne(query);
			},
			createIndex: (value: any, index: any) => {
				MongoInstance.CreateIndexSpy(value, index);
				return MongoInstance.database.collection(this._collectionName).createIndex(value, index);
			},
			find: (query: any, options: any) => {
				MongoInstance.FindSpy(query, options);
				return MongoInstance.database.collection(this._collectionName).find(query, options);
			}
		};
	}
}
