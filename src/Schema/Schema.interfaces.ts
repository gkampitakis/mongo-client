/* eslint-disable @typescript-eslint/no-explicit-any */

export type SchemaDefinition = ObjectSchema;

type NestedSchema = undefined | ObjectSchema | NumberSchema | StringSchema | ArraySchema | BooleanSchema | NullSchema;

interface ObjectSchema extends CommonKeys {
	type: 'object';
	maxProperties?: number;
	minProperties?: number;
	properties: {
		[key: string]: NestedSchema;
	};
	required?: string[];
	patternProperties?: {
		[key: string]: NestedSchema;
	};
	default?: object;
	additionalProperties?: boolean;
	dependencies?: {
		[key: string]: string[] | NestedSchema;
	};
	propertyNames?: NestedSchema;
}

interface BooleanSchema {
	type: 'boolean';
	default?: boolean;
}

interface NullSchema {
	type: 'null';
}

interface NumberSchema extends CommonKeys {
	type: 'number' | 'integer';
	maximum?: number;
	minimum?: number;
	exclusiveMaximum?: boolean;
	exclusiveMinimum?: boolean;
	multipleOf?: any;
	default?: number;
	unique?: boolean;
}

interface StringSchema extends CommonKeys {
	type: 'string';
	maxLength?: number;
	minLength?: number;
	pattern?: any;
	format?: string;
	formatMaximum?: string;
	formatMinimum?: string;
	formatExclusiveMaximum?: boolean;
	formatExclusiveMinimum?: boolean;
	default?: string;
	unique?: boolean;
}

interface ArraySchema extends CommonKeys {
	type: 'array';
	maxItems?: number;
	minItems?: number;
	uniqueItems?: boolean;
	items?: object | object[];
	additionalItems?: boolean | object;
	contains?: NestedSchema;
	default?: any[];
}

interface CommonKeys {
	enum?: any[];
	const?: any;
	not?: NestedSchema;
}

export interface ValidatorOptions {
	useDefaults: boolean;
	removeAdditional: 'all' | 'failing' | boolean;
	allErrors?: boolean;
}

//TODO: read again the documentation and re revaluate
//TODO: Write comments for the interfaces ???
