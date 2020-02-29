import { Schema } from './Schema';
import { Db } from 'mongodb';

jest.mock('kareem');

describe('Schema', () => {
	let schema: Schema;
	const KareemMock = jest.requireMock('kareem').Kareem;

	beforeEach(() => {
		KareemMock.PostSpy.mockClear();
		KareemMock.ExecutePostSpy.mockClear();
		KareemMock.PreSpy.mockClear();
		KareemMock.ExecutePreSpy.mockClear();
	});

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

		it('Should not throw error if not schema provided', () => {
			const schema = new Schema();

			expect(() => schema.isValid({ test: 'test' })).not.toThrowError();
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
				_id: '12345',
				test: 'test',
				username: {
					newName: {
						test: 'test'
					}
				},
				blue: { username: 'test' }
			};

			expect(schema.sanitizeData(data)).toEqual({
				_id: '12345',
				username: {
					newName: {
						test: 'test'
					}
				}
			});
		});

		it('Should return the document if not schema', () => {
			const schema = new Schema(),
				data = {
					_id: '12345',
					test: 'test',
					username: {
						newName: {
							test: 'test'
						}
					},
					blue: { username: 'test' }
				};

			expect(schema.sanitizeData(data)).toEqual(data);
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

	describe('Method pre/post', () => {
		it('Should call the hooks pre/post function', () => {
			const schema = new Schema();

			schema.post('save', () => 'test');
			schema.pre('save', () => 'test');

			expect(KareemMock.PostSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
			expect(KareemMock.PreSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
		});
	});

	describe('Method execute pre/post hooks', () => {
		it('Should call the execute pre/post hooks function if hooks registered', async () => {
			const schema = new Schema();

			KareemMock._pres.set('test', () => 'test');
			KareemMock._posts.set('test', () => 'test');

			await schema.executePostHooks('save', () => 'test');
			await schema.executePreHooks('save', () => 'test');

			expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(1);
			expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(1);
		});

		it('Should not call the execute pre/post hooks function if no hooks registered', async () => {
			KareemMock._pres = new Map();
			KareemMock._posts = new Map();

			const schema = new Schema();

			await schema.executePostHooks('save', () => 'test');
			await schema.executePreHooks('save', () => 'test');

			expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(0);
			expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(0);
		});
	});
});
