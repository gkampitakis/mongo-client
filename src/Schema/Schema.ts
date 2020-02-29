/* eslint-disable @typescript-eslint/no-empty-function */
import { Db, ObjectId } from 'mongodb';
import { stripObject } from '../Utils/Utils';
import kareem from 'kareem';

type FieldType = 'string' | 'number' | 'object' | typeof ObjectId;

type HooksType = 'save' | 'delete' | 'update' | 'remove' | 'create' | 'delete';

export interface SchemaModel {
	[key: string]: {
		type: FieldType | { type: FieldType; ref: Schema }[]; //TODO: this will need further investigation //BUG: this should have a model reference
		required?: boolean;
		default?: any;
		unique?: boolean;
	};
}

export class Schema {
	private _schema: SchemaModel;
	private hooks: any;

	public constructor(schema: SchemaModel) {
		this._schema = schema;
		this.hooks = new kareem();
	}

	get schemaObject(): SchemaModel {
		return this._schema;
	}

	public post(hook: HooksType, callback: Function) {
		this.hooks.post(hook, callback);
	}

	public pre(hook: HooksType, callback: Function) {
		this.hooks.pre(hook, callback);
	}

	/** @internal */
	public executePreHooks(hook: HooksType, context: any): Promise<void> {
		return new Promise(resolve => {
			if (this.hooks._pres.size <= 0) return resolve();

			this.hooks.execPre(hook, stripObject(context), [context], () => {
				resolve();
			});
		});
	}

	/** @internal */
	public executePostHooks(hook: HooksType, context: any): Promise<void> {
		return new Promise(resolve => {
			if (this.hooks._posts.size <= 0) return resolve();

			this.hooks.execPost(hook, stripObject(context), [context], () => {
				resolve();
			});
		});
	}

	/** @internal */
	public isValid(document: any, ignoreRequired = false) {
		const schema = this._schema;

		for (const field in schema) {
			if (schema[field].required && !ignoreRequired && !document[field] && !schema[field].default)
				throw new Error(`${field} field is required`);

			if (schema[field].default && !document[field]) document[field] = schema[field].default;

			if (document[field] && schema[field].type !== typeof document[field]) {
				throw new Error(`${field} must be type of ${schema[field].type}`);
			}
		}
	}

	/** @internal */
	public sanitizeData(document: any) {
		const schema = this._schema,
			sanitizedDoc: any = {};

		for (const field in schema) {
			if (document[field]) {
				sanitizedDoc[field] = document[field];
			}
		}

		if (document._id) sanitizedDoc._id = document._id;

		return sanitizedDoc;
	}

	/** @internal */
	public async setupCollection(collectionName: string, db: Db) {
		const collection = await db.createCollection(collectionName);

		const schema = this._schema;

		for (const field in schema) {
			if (schema[field].unique) {
				const index: any = {};
				index[field] = 1;

				collection.createIndex(index, { unique: true });
			}
		}
	}
}

/**
 *  ------------ BACKLOG ------------
 *  //TODO: Paths
 *  //Populate and schema reference to another Model
 *  //TODO: support hooks without schema restrictions
 */
