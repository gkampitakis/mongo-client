import { Schema } from './Schema';
import { Db } from 'mongodb';

describe('Schema', () => {
	let schema: Schema;

	describe('Method isValid', () => {
		it('Should throw error if required is missing', () => {
			schema = new Schema({
				username: {
					type: 'string',
					required: true
				}
			});

			expect(() => schema.isValid({})).toThrowError('username field is required');
		});

		it("Should throw error if default value doesn't have the same type", () => {
			schema = new Schema({
				username: {
					type: 'string',
					default: []
				},
				test: {
					type: 'string'
				}
			});

			expect(() =>
				schema.isValid({
					test: 'test'
				})
			).toThrowError('username must be type of string');
		});

		it('Should throw error if data are different type of schema', () => {
			schema = new Schema({
				username: {
					type: 'string',
					required: true
				}
			});

			expect(() => schema.isValid({ username: { test: 'test' } })).toThrowError(
				'username must be type of string'
			);
		});

		it('Should ignore the required validation', () => {
			schema = new Schema({
				username: {
					type: 'string',
					required: true
				}
			});

			expect(() => schema.isValid({}, true)).not.toThrowError();
		});

		it('Should not throw error if valid data', () => {
			schema = new Schema({
				username: {
					type: 'string',
					required: true
				}
			});

			expect(() => schema.isValid({ username: 'test' })).not.toThrowError();
		});
	});

	describe('Method sanitizeData', () => {
		it('Should remove all non present fields in schema', () => {
			schema = new Schema({
				username: {
					type: 'string',
					required: true
				}
			});

			const data = {
				test: 'test',
				username: {
					newName: {
						test: 'test'
					}
				},
				blue: { username: 'test' }
			};

			expect(schema.sanitizeData(data)).toEqual({
				username: {
					newName: {
						test: 'test'
					}
				}
			});
		});
	});

	describe('Method setupCollection', () => {
		it('Should create collections and unique indexes based on schema', done => {
			const createCollectionSpy = jest.fn(),
				createIndexSpy = jest.fn(),
				dbMock = {
					createCollection: (collection: string) => {
						createCollectionSpy(collection);

						return new Promise(resolve => {
							resolve({
								createIndex: (index: object, options: object) => {
									createIndexSpy(index, options);
								}
							});
						});
					}
				};

			schema = new Schema({
				username: {
					type: 'string',
					required: true,
					unique: true
				},
				email: {
					type: 'string',
					required: true,
					unique: true
				},
				password: {
					type: 'string',
					required: false,
					unique: false
				}
			});

			schema.setupCollection('test', (dbMock as unknown) as Db);

			setTimeout(() => {
				expect(createIndexSpy.mock.calls).toEqual([
					[{ username: 1 }, { unique: true }],
					[{ email: 1 }, { unique: true }]
				]);
				expect(createCollectionSpy).toHaveBeenNthCalledWith(1, 'test');

				done();
			}, 1000);
		});
	});
});
