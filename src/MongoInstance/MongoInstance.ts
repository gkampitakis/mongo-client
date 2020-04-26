import { Schema } from '../Schema/Schema';
import { Collection, Db } from 'mongodb';

export abstract class MongoInstance {
	private readonly _collectionName: string;
	protected readonly _schema: Schema | undefined;
	protected static database: Db;

	public constructor(collectionName: string, schema?: Schema) {
		this._collectionName = collectionName;
		this._schema = schema;
	}

	get collectionName(): string {
		return this._collectionName;
	}

	protected get collection(): Collection {
		if (!MongoInstance.database) throw new Error('MongoClient not correctly initialized');

		return MongoInstance.database.collection(this._collectionName);
	}

	/** @internal */
	static setDb(db: Db) {
		if (!MongoInstance.database) MongoInstance.database = db;
	}
}
