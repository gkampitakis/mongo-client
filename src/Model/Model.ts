import { extractUniqueValues, objectEquality, objectID } from '../Utils/Utils';
import {
	CollectionInsertOneOptions,
	CommonOptions,
	Cursor,
	DeleteWriteOpResultObject,
	FilterQuery,
	FindOneOptions
} from 'mongodb';
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

	public findOne(
		query: FilterQuery<any>,
		options: FindOneOptions & { lean?: boolean } = { lean: false }
	): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const { lean, ...rest } = options;
				const result = await this.collection.findOne(query, rest);

				if (!result) return resolve(null);

				if (lean) return resolve(result);

				const wrappedDoc = Document(this.collectionName, result, this._schema);

				resolve(wrappedDoc);
			} catch (error) {
				reject(error);
			}
		});
	}

	public findById(id: string, options?: FindOneOptions & { lean?: boolean }): Promise<any> {
		return this.findOne({ _id: id }, options);
	}

	public findByIdAndDelete(
		id: string,
		options?: CommonOptions & { bypassDocumentValidation?: boolean; lean: boolean }
	): Promise<any> {
		return this.deleteOne({ _id: id }, options);
	}

	public findByIdAndUpdate(id: string, update: object, lean = false): Promise<any> {
		return this.updateOne({ _id: id }, update, lean);
	}

	public find(filter: FilterQuery<any>, options?: FindOneOptions): Cursor<any> {
		return this.collection.find(filter, options);
	}

	public updateOne(filter: FilterQuery<any>, update: object, lean = false): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const document = await this.findOne(filter, { lean: true });

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

	public deleteMany(filter: FilterQuery<object>, options?: CommonOptions) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.collection.deleteMany(filter, options);

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	public deleteOne(
		filter: FilterQuery<any>,
		options?: CommonOptions & { bypassDocumentValidation?: boolean; lean: boolean }
	): Promise<DeleteWriteOpResultObject | null> {
		if (this._schema?.hasPreHooks || this._schema?.hasPostHooks) return this.deleteOneWithHooks(filter, options);
		return this.deleteOneWithoutHooks(filter, options);
	}

	private deleteOneWithHooks(
		filter: object,
		options: CommonOptions & { bypassDocumentValidation?: boolean; lean: boolean } = { lean: false }
	): Promise<DeleteWriteOpResultObject | null> {
		return new Promise(async (resolve) => {
			const document = await this.collection.findOne(filter),
				{ lean, ...rest } = options;

			if (!document) return resolve(null);

			const wrappedDoc = options?.lean ? document : Document(this.collectionName, document, this._schema);

			await this._schema?.executePreHooks('delete', wrappedDoc, lean);

			const result = this.collection.deleteOne(filter, rest);

			await this._schema?.executePostHooks('delete', wrappedDoc, lean);

			resolve(result);
		});
	}

	private deleteOneWithoutHooks(
		filter: object,
		options: CommonOptions & { bypassDocumentValidation?: boolean; lean: boolean } = { lean: false }
	): Promise<DeleteWriteOpResultObject | null> {
		const { lean, ...rest } = options;
		return this.collection.deleteOne(filter, rest);
	}

	public instance<Generic extends ExtendableObject>(data: Generic): Document<Generic & ExtendableObject> {
		return Document<Generic & ExtendableObject>(this.collectionName, data, this._schema);
	}

	public create(
		data: object,
		options: CollectionInsertOneOptions & { lean: boolean } = { lean: false }
	): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				let wrappedDoc: any;

				const { lean, ...rest } = options;

				if (lean) {
					wrappedDoc = data;
					wrappedDoc._id = objectID();
				} else {
					wrappedDoc = Document(this.collectionName, data, this._schema);
				}

				await this._schema?.executePreHooks('create', wrappedDoc, lean);

				await this.collection.insertOne(lean ? wrappedDoc : wrappedDoc.data, rest);

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
		if (!InternalModel.database) await this.checkConnection();
		return await InternalModel.database.listCollections({ name: collectionName }).hasNext();
	}

	private checkConnection(): Promise<boolean> {
		return new Promise((resolve) => {
			let retries = 0;
			const timer = setInterval(() => {
				retries++;
				if (InternalModel.database) {
					resolve(true);
					clearInterval(timer);
				}
				if (retries === 30) {
					clearInterval(timer);
				}
			}, 1005);
		});
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
	create<Generic extends ExtendableObject>(
		data: Generic & ExtendableObject,
		options: CollectionInsertOneOptions & { lean: boolean }
	): Promise<ExtendableObject & { _id: string }>;
	deleteMany(filter: FilterQuery<object>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
	findByIdAndUpdate(id: string, update: object, lean?: false): Promise<Document>;
	findByIdAndUpdate(id: string, update: object, lean?: true): Promise<ExtendableObject & { _id: string }>;
	updateOne(filter: FilterQuery<any>, update: object, lean?: false): Promise<Document>;
	updateOne(filter: FilterQuery<any>, update: object, lean?: true): Promise<ExtendableObject & { _id: string }>;
	findById(id: string, options?: FindOneOptions & { lean?: false }): Promise<Document>;
	findById(id: string, options?: FindOneOptions & { lean?: true }): Promise<ExtendableObject & { _id: string }>;
	findOne(query: FilterQuery<any>, options?: FindOneOptions & { lean?: false }): Promise<Document>;
	findOne(
		query: FilterQuery<any>,
		options?: FindOneOptions & { lean?: true }
	): Promise<ExtendableObject & { _id: string }>;
	find(query: object, options?: FindOneOptions): Cursor<any>;
	deleteOne(
		filter: FilterQuery<any>,
		options?: CommonOptions & { bypassDocumentValidation?: boolean; lean: boolean }
	): Promise<DeleteWriteOpResultObject | null>;
	findByIdAndDelete(
		id: string,
		options?: CommonOptions & { bypassDocumentValidation?: boolean; lean: boolean }
	): Promise<DeleteWriteOpResultObject | null>;
};

interface ExtendableObject {
	[key: string]: any;
}
