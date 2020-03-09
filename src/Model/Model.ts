import { extractUniqueValues, objectEquality, objectID } from '../Utils/Utils';
import { DeleteWriteOpResultObject, FilterQuery } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { Document } from '../Document/Document';
import { SchemaDefinition } from '../Schema/Schema.interfaces';

/** @internal */
class InternalModel extends MongoInstance {
	public static cache: Map<string, InternalModel> = new Map();

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

	public findById(id: string, lean?: boolean): Promise<any> {
		const _id = objectID(id);

		return this.findOne({ _id }, lean);
	}

	public findByIdAndUpdate(id: string, update: object, lean = false): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const document = await this.findById(id, true);

				if (!document) return resolve(null);

				const updatedData = { ...document, ...update };

				this._schema?.validate(updatedData);

				if (objectEquality(document, updatedData)) return resolve(document);

				await this._schema?.executePreHooks(
					'update',
					lean ? document : Document(this.collectionName, document, this._schema),
					lean
				);

				//FIXME:Here needs testing if we change the pre hook data will affect the update data as well ??

				await this.collection.updateOne({ _id: id }, { $set: update });

				const wrappedDoc = lean ? updatedData : Document(this.collectionName, updatedData, this._schema);

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

	public deleteOne(filter: object): Promise<DeleteWriteOpResultObject> {
		return this.collection.deleteOne(filter);
	}

	public instance<Generic extends ExtendableObject>(data: Generic): Document<Generic & ExtendableObject> {
		return Document<Generic & ExtendableObject>(this.collectionName, data, this._schema);
	}

	public create<Generic>(data: Generic, lean = false): Promise<any> {
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
	if (InternalModel.cache.has(collectionName)) {
		return InternalModel.cache.get(collectionName) as Model;
	}

	const newModel = new InternalModel(collectionName, schema);

	InternalModel.cache.set(collectionName, newModel);

	return newModel as Model;
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
	findById(id: string, lean?: false): Promise<Document>;
	findById(id: string, lean?: true): Promise<ExtendableObject>;
	findOne(query: object, lean?: false): Promise<Document>;
	findOne(query: object, lean?: true): Promise<ExtendableObject>;
	deleteOne(filter: object): Promise<DeleteWriteOpResultObject>;
};

interface ExtendableObject {
	[key: string]: any;
}

/**
 *  ------------ BACKLOG ------------
 *  //TODO: find the way that you write comments and they are shown above in the editor
 * //BUG: doesn't make sense the caching should be removed
 */
