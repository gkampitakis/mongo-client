import { extractUniqueValues, isEmptyObject, objectID, stripObject } from './';
import { ObjectID } from 'mongodb';
import { Document } from '../Document/Document';
import { Schema } from '../Schema/Schema';
import { SchemaDefinition } from '../Schema';

describe('Utils', () => {
	describe('Function isEmptyObject', () => {
		it('Should return true if object is empty', () => {
			const testObject = {};

			expect(isEmptyObject(testObject)).toBe(true);
		});

		it('Should return true if no object', () => {
			expect(isEmptyObject()).toBe(true);
		});

		it('Should return false if object is not empty', () => {
			const testObject = {
				field: 'test',
				anotherField: []
			};

			expect(isEmptyObject(testObject)).toBe(false);
		});
	});

	describe('Function objectId', () => {
		it('Should throw error if not valid id', () => {
			expect(() => objectID('123')).toThrowError('Invalid id provided');
		});

		it('Should return a new objectId', () => {
			const id = '5e4acf03d8e9435b2a2640ae';

			expect(objectID(id)).toBeInstanceOf(ObjectID);
			expect(objectID(id).toHexString()).toBe(id);
		});

		it('Should return a new objectId if not parameter provider', () => {

			expect(objectID()).toBeInstanceOf(ObjectID);
		});
	});

	describe('Function stripObject', () => {
		it('Should return the appropriate object', () => {
			const doc = stripObject(Document('test', {}, new Schema()));

			expect(doc).toHaveProperty('data');
			expect(doc).toHaveProperty('lean');
			expect(doc).toHaveProperty('save');
			expect(doc).toHaveProperty('remove');
			expect(doc).toHaveProperty('collectionName');
		});
	});

	describe('Function extractUniqueValues', () => {
		it('Should return the paths with unique values', () => {
			const object = {
				test: {
					name: {
						unique: true
					}
				},
				test2: {
					unique: true
				}
			};

			expect(extractUniqueValues((object as never) as SchemaDefinition)).toEqual(['test.name', 'test2']);
		});

		it('Should return nothing if no required', () => {
			const object = {
				test: {
					name: {
						test: true
					}
				},
				test2: {
					test: true
				}
			};

			expect(extractUniqueValues((object as never) as SchemaDefinition)).toEqual([]);
		});
	});
});
