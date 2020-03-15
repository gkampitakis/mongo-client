import { extractUniqueValues, objectEquality, objectID } from '../Utils/Utils';
import { DeleteWriteOpResultObject, FilterQuery } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { Document } from '../Document/Document';
import { SchemaDefinition } from '../Schema/Schema.interfaces';

/** @internal */
class InternalModel extends MongoInstance {
	public constructor(collectionName: string, schema?: Schema) {
		super(collectionName, schema);
		if (schema?.schemaDefinition) this.prepareCollection(collectionName, schema!.schemaDefinition);
	}

	public findOne(query: object, lean?: boolean): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await this.collection.findOne(query);

				if (!result) return resolve(null);

				if (lean) return resolve(result);

				const wrappedDoc = Document(this.collectionName, result, this._schema);

				resolve(wrappedDoc);
			} catch (error) {
				reject(error);
			}
		});
	}

	public findById(id: string, lean = false): Promise<any> {
		return this.findOne({ _id: id }, lean);
	}

	public findByIdAndDelete(id: string, lean = false): Promise<any> {
		return this.deleteOne({ _id: id }, lean);
	}

	public findByIdAndUpdate(id: string, update: object, lean = false): Promise<any> {
		return this.updateOne({ _id: id }, update, lean);
	}

	public updateOne(filter: object, update: object, lean = false): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const document = await this.findOne(filter, true);

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

	public deleteMany(filter: FilterQuery<object>) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.collection.deleteMany(filter);

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	public deleteOne(filter: object, lean = false): Promise<DeleteWriteOpResultObject | null> {
		if (this._schema?.hasPreHooks || this._schema?.hasPostHooks) return this.deleteOneWithHooks(filter, lean);
		return this.deleteOneWithoutHooks(filter);
	}

	private deleteOneWithHooks(filter: object, lean = false): Promise<DeleteWriteOpResultObject | null> {
		return new Promise(async resolve => {
			const document = await this.collection.findOne(filter);

			if (!document) return resolve(null);

			const wrappedDoc = lean ? document : Document(this.collectionName, document, this._schema);

			await this._schema?.executePreHooks('delete', wrappedDoc, lean);

			const result = this.collection.deleteOne(filter);

			await this._schema?.executePostHooks('delete', wrappedDoc, lean);

			resolve(result);
		});
	}

	private deleteOneWithoutHooks(filter: object): Promise<DeleteWriteOpResultObject | null> {
		return this.collection.deleteOne(filter);
	}

	public instance<Generic extends ExtendableObject>(data: Generic): Document<Generic & ExtendableObject> {
		return Document<Generic & ExtendableObject>(this.collectionName, data, this._schema);
	}

	public create(data: object, lean = false): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				let wrappedDoc: any;

				if (lean) {
					wrappedDoc = data;
					wrappedDoc._id = objectID();
				} else {
					wrappedDoc = Document(this.collectionName, data, this._schema);
				}

				await this._schema?.executePreHooks('create', wrappedDoc, lean);

				await this.collection.insertOne(lean ? wrappedDoc : wrappedDoc.data);

				await this._schema?.executePostHooks('create', wrappedDoc, lean);

				resolve(wrappedDoc);
			} catch (error) {
				reject(error);
			}
		});
	}

	private async prepareCollection(collectionName: string, schemaDefinition: SchemaDefinition) {
		const collectionExists = await this.collectionExists(collectionName);

		if (collectionExists) return;

		const values = extractUniqueValues(schemaDefinition);

		for (const value of values) {
			this.collection.createIndex(value, { unique: true, sparse: true });
		}
	}

	private async collectionExists(collectionName: string) {
		return await InternalModel.database.listCollections({ name: collectionName }).hasNext();
	}
}

export function Model(collectionName: string, schema?: Schema): Model {
	return new InternalModel(collectionName, schema) as Model;
}

export type Model = {
	instance<Generic extends ExtendableObject>(data: Generic & ExtendableObject): Document<Generic & ExtendableObject>;
	create<Generic extends ExtendableObject>(
		data: Generic & ExtendableObject,
		lean?: false
	): Promise<Document<Generic & ExtendableObject>>;
	create<Generic extends ExtendableObject>(data: Generic & ExtendableObject, lean?: true): Promise<ExtendableObject>;
	deleteMany(filter: FilterQuery<object>): Promise<DeleteWriteOpResultObject>;
	findByIdAndUpdate(id: string, update: object, lean?: false): Promise<Document>;
	findByIdAndUpdate(id: string, update: object, lean?: true): Promise<ExtendableObject>;
	updateOne(filter: object, update: object, lean?: false): Promise<Document>;
	updateOne(filter: object, update: object, lean?: true): Promise<ExtendableObject>;
	findById(id: string, lean?: false): Promise<Document>;
	findById(id: string, lean?: true): Promise<ExtendableObject>;
	findOne(query: object, lean?: false): Promise<Document>;
	findOne(query: object, lean?: true): Promise<ExtendableObject>;
	deleteOne(filter: object, lean?: boolean): Promise<DeleteWriteOpResultObject | null>;
	findByIdAndDelete(id: string, lean?: boolean): Promise<DeleteWriteOpResultObject | null>;
};

interface ExtendableObject {
	[key: string]: any;
}

/**
 *  ------------ BACKLOG ------------
 *  //TODO: optimize methods
 * 
 * 
 */
