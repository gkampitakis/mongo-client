import { Document } from '../Document/Document';
import { SchemaDefinition } from '../Schema';
import { ObjectID } from 'mongodb';
import flat from 'flat';
import equal from 'fast-deep-equal';

/** @internal */
function isEmptyObject(object?: {}): boolean {
	if (!object) return true;
	return Object.keys(object).length === 0;
}

/** @internal */
function objectID(id?: string): ObjectID {
	if (id && !ObjectID.isValid(id)) throw new Error('Invalid id provided');

	return new ObjectID(id);
}

/** @internal */
function stripObject(document: Document): Document {
	return {
		data: document.data,
		lean: document.lean,
		save: document.save,
		remove: document.remove,
		collectionName: document.collectionName,
		schema: document.schema
	};
}

/** @internal */
function extractUniqueValues(schema: SchemaDefinition): string[] {
	const result: object = flat(schema),
		uniqueValues: string[] = [];

	for (const field in result) {
		const absolutePath = field.replace(new RegExp('properties.', 'g'), ''),
			parse = absolutePath.split('.'),
			value = result[field];

		if (parse[parse.length - 1] === 'unique' && value) uniqueValues.push(absolutePath.replace('.unique', ''));
	}

	return uniqueValues;
}

/** @internal */
function objectEquality(target: object, source: object): boolean {
	return equal(target, source);
}

export { objectEquality, extractUniqueValues, stripObject, objectID, isEmptyObject };
