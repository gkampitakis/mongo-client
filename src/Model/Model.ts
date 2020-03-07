import { extractUniqueValues, objectID } from '../Utils/Utils';
import {
	DeleteWriteOpResultObject,
	FilterQuery,
	FindAndModifyWriteOpResultObject,
	FindOneAndUpdateOption
} from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { Document } from '../Document/Document';
import { SchemaDefinition } from "../Schema/Schema.interfaces";

/** @internal */
class InternalModel extends MongoInstance {
	public static cache: Map<string, InternalModel> = new Map();

	public constructor(collectionName: string, schema?: Schema) {
		super(collectionName, schema);
		if (schema?.schemaDefinition) this.prepareCollection(collectionName, schema!.schemaDefinition);
	}

	public findOne(query: object, options: ModelOptions = { lean: false }): Promise<Document | object | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await this.collection.findOne(query);

				if (!result) return resolve(null);

				if (options.lean) return resolve(result);

				const wrappedDoc = Document(this.collectionName, result, this._schema);

				resolve(wrappedDoc);
			} catch (error) {
				reject(error);
			}
		});
	}

	public findById(id: string, options: ModelOptions = { lean: false }): Promise<Document | object | null> {
		const _id = objectID(id);

		return this.findOne({ _id }, options);
	}

	// public findByIdAndUpdate(id: string, update: object, options?: FindOneAndUpdateOption & QueryOptions) {
	// 	const _id = objectID(id); //REFACTOR:

	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			const validData = this._schema?.sanitizeData(update) || update;

	// 			if (isEmptyObject(validData)) return resolve(null);

	// 			this._schema?.isValid(update, true);
	// 			//TODO: check if here the update object is correct
	// 			await this._schema?.executePreHooks('update', Document(this.collectionName, update, this._schema));

	// 			const result = await this.collection.findOneAndUpdate({ _id }, { $set: validData }, options);

	// 			if (!result.value) {
	// 				await this._schema?.executePostHooks('update', {});

	// 				return resolve(null);
	// 			}

	// 			const wrappedDoc = Document(this.collectionName, result.value, this._schema);

	// 			await this._schema?.executePostHooks('update', wrappedDoc);

	// 			resolve(wrappedDoc);
	// 		} catch (error) {
	// 			reject(error);
	// 		}
	// 	});
	// }

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

	// public deleteOne(filter: object, options: DeleteOptions) {//TODO: implement

	// }

	public instance<Generic extends ExtendableObject>(data: Generic): Document<Generic & ExtendableObject> {
		return Document<Generic & ExtendableObject>(this.collectionName, data, this._schema);
	}

	public create<Generic>(data: Generic, options: ModelOptions = { lean: false }): Promise<Document<Generic> | object> {
		return new Promise(async (resolve, reject) => {
			try {

				let wrappedDoc: any;

				if (options.lean) {

					wrappedDoc = data;
					wrappedDoc._id = objectID();

				} else {

					wrappedDoc = Document(this.collectionName, data, this._schema);

				}

				await this._schema?.executePreHooks('create', wrappedDoc);

				await this.collection.insertOne(options.lean ? wrappedDoc : wrappedDoc.data);

				await this._schema?.executePostHooks('create', wrappedDoc);

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

			this.collection.createIndex(value, { unique: true });

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
		options?: ModelOptions
	): Promise<Document<Generic & ExtendableObject | object>>;
	deleteMany(filter: FilterQuery<object>): Promise<DeleteWriteOpResultObject>;
	// findByIdAndUpdate(
	// 	id: string,
	// 	update: object,
	// 	options?: FindOneAndUpdateOption
	// ): Promise<FindAndModifyWriteOpResultObject<object>>;
	findById(id: string, options?: ModelOptions): Promise<Document | null | object>;
	findOne(query: object, options?: ModelOptions): Promise<Document | null | object>;
	// deleteOne(filter:object,options?:DeleteOptions);
};

interface ExtendableObject {
	[key: string]: any;
}

interface ModelOptions {
	lean: boolean;
}

interface DeleteOptions extends ModelOptions {
	resolve: boolean;
}

/**
 *  ------------ BACKLOG ------------
 *  //TODO: find the way that you write comments and they are shown above in the editor
 *  //TODO: populate at documents
 */
