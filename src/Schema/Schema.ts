// @ts-nocheck
/* eslint-disable @typescript-eslint/no-empty-function */
import { SchemaDefinition, ValidatorOptions } from './Schema.interfaces';
import { stripObject } from '../Utils';
import kareem from 'kareem';
import Ajv, { ErrorObject } from 'ajv';

type HooksType = 'save' | 'delete' | 'update' | 'remove' | 'create' | 'delete';

export class Schema {
	private _schema: SchemaDefinition | undefined;
	private hooks: any;
	private validator: Ajv.ValidateFunction | undefined;

	public constructor(
		schema?: SchemaDefinition,
		options: ValidatorOptions = { useDefaults: true, removeAdditional: true }
	) {
		this._schema = schema;
		this.hooks = new kareem();
		const ajv = new Ajv(options);
		if (schema) this.validator = ajv.compile(schema);
	}

	get schemaDefinition(): SchemaDefinition | undefined {
		return this._schema;
	}

	public post(hook: HooksType, callback: Function) {
		this.hooks.post(hook, callback);
	}

	public pre(hook: HooksType, callback: Function) {
		this.hooks.pre(hook, callback);
	}

	/** @internal */
	public executePreHooks(hook: HooksType, context: any, lean: boolean): Promise<void> {
		return new Promise(resolve => {
			if (this.hooks._pres.size <= 0) return resolve();
			this.hooks.execPre(hook, lean ? context : stripObject(context), [context], () => {
				resolve();
			});
		});
	}

	/** @internal */
	public executePostHooks(hook: HooksType, context: any, lean: boolean): Promise<void> {
		return new Promise(resolve => {
			if (this.hooks._posts.size <= 0) return resolve();
			this.hooks.execPost(hook, lean ? context : stripObject(context), [context], () => {
				resolve();
			});
		});
	}

	public validate(data: any): object | void {
		if (!this._schema) return data;
		//@ts-ignore
		if (!this.validator(data)) {
			//@ts-ignore
			throw new Error(this.getError(this.validator.errors[0]));
		}

		return data;
	}

	private getError(errorObject: ErrorObject): string {
		return `[${errorObject.keyword}] ${errorObject.dataPath} - ${errorObject.message}`;
	}
}

/**   ------------ BACKLOG ------------
 *  //TODO: Paths
 *	//TODO: Methods
 **/
