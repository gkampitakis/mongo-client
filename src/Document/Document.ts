/* eslint-disable @typescript-eslint/class-name-casing */
import { ObjectID } from 'mongodb';
import { Schema, SchemaDefinition } from '../Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { stripObject } from '../Utils';

/** @internal */
class _Document extends MongoInstance {
	public data: any;

	public constructor(collectionName: string, data: any, schema?: Schema) {
		super(collectionName, schema);

		this.data = data;

		this.prepareData(data);
	}

	public remove = (): Promise<{}> => {
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

	public save = async (): Promise<Document> => {
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

	public lean = () => {
		return this.data;
	};

	get schema() {
		return this._schema?.schemaDefinition;
	}

	private prepareData(data: any) {
		if (!this._schema) return;
		const id = this.data._id || new ObjectID();
		this.data = this._schema!.validate(data);
		if (id) this.data._id = id;
	}
}

/** @internal */
export function Document<Generic>(collectionName: string, data: Generic, schema?: Schema): Document<Generic> {
	return stripObject(new _Document(collectionName, data, schema));
}

export type Document<data = any> = {
	data: { _id: string } & data;
	lean: () => { _id: string } & data;
	save: () => void;
	remove: () => Promise<any>;
	schema: SchemaDefinition | undefined;
	collectionName: string;
};
