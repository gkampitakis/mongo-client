/* eslint-disable @typescript-eslint/no-empty-function */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Document } from './Document';
import mongodb, { MongoClient, ObjectID } from 'mongodb';
import { Schema } from '../Schema/Schema';

jest.mock('../Utils/Utils');
jest.mock('../MongoInstance/MongoInstance');
jest.mock('../Schema/Schema');

describe('Document', () => {
	const { StripObjectSpy, ObjectIdSpy, IsEmptyObjectSpy } = jest.requireMock('../Utils/Utils'),
		SchemaMock = jest.requireMock('../Schema/Schema').Schema,
		MongoInstanceMock = jest.requireMock('../MongoInstance/MongoInstance').MongoInstance;

	let mongod: MongoMemoryServer;

	beforeAll(async done => {
		mongod = new MongoMemoryServer();

		const mongoURI = await mongod.getUri(),
			dbName = await mongod.getDbName();

		mongodb.connect(mongoURI, { useUnifiedTopology: true }).then((client: MongoClient) => {
			MongoInstanceMock.database = client.db(dbName);
			done();
		});
	});

	afterAll(async done => {
		await mongod.stop();

		done();
	});

	beforeEach(() => {
		SchemaMock.SetupCollectionSpy.mockClear();
		SchemaMock.SanitizeDataSpy.mockClear();
		SchemaMock.IsValidSpy.mockClear();
		SchemaMock.PreHookSpy.mockClear();
		SchemaMock.PostHookSpy.mockClear();
		SchemaMock.ExecutePreHooksSpy.mockClear();
		SchemaMock.ExecutePostHooksSpy.mockClear();
		MongoInstanceMock.GetCollectionSpy.mockClear();
		MongoInstanceMock.GetCollectionNameSpy.mockClear();
		ObjectIdSpy.mockClear();
		StripObjectSpy.mockClear();
		IsEmptyObjectSpy.mockClear();

		/**Mongo DB operations Spies */
		MongoInstanceMock.UpdateOneSpy.mockClear();
		MongoInstanceMock.DeleteOneSpy.mockClear();

		SchemaMock.schemaObject = {};
	});

	describe('Constructor', () => {
		it('should call the stripObject/sanitizeData/isValid and return an object', () => {
			SchemaMock.schemaObject = { test: { type: 'string' } };
			Document('document_test', {}, new Schema({ test: { type: 'string' } }));

			expect(SchemaMock.IsValidSpy).toHaveBeenNthCalledWith(1, {});
			expect(SchemaMock.SanitizeDataSpy).toHaveBeenNthCalledWith(1, {});
			expect(StripObjectSpy).toHaveBeenCalledTimes(1);
		});

		it('Should not call the valid/sanitize data if schema has empty object model', () => {
			Document('document_test', new Schema());

			expect(SchemaMock.IsValidSpy).not.toHaveBeenCalled();
			expect(SchemaMock.SanitizeDataSpy).not.toHaveBeenCalled();
			expect(StripObjectSpy).toHaveBeenCalledTimes(1);
		});

		it('Should not call the is valid/sanitize data if schema is not provided', () => {
			Document('document_test', {});

			expect(SchemaMock.IsValidSpy).not.toHaveBeenCalled();
			expect(SchemaMock.SanitizeDataSpy).not.toHaveBeenCalled();
			expect(StripObjectSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('Method get schema', () => {
		it('Should return the schema object', () => {
			SchemaMock.schemaObject = { test: { type: 'string' } };
			const doc = Document('document_test', {}, new Schema({ test: { type: 'string' } }));

			expect(doc.schema).toEqual({ test: { type: 'string' } });
		});

		it('Should return undefined if no schemaDefinition', () => {
			const doc = Document('document_test', {});
			expect(doc.schema).toBeUndefined();
		});
	});

	describe('Method remove', () => {
		it('Should call delete operation', async () => {
			const doc = Document('document_test', {}, new Schema());

			await doc.save();

			const result = await doc.remove();

			expect(MongoInstanceMock.DeleteOneSpy).toHaveBeenNthCalledWith(1, { _id: new ObjectID(doc.data._id) });
			expect(result).toEqual(doc);
		});

		describe('When schema is not present', () => {
			it('Should not call the execute pre/post hooks', async () => {
				const doc = Document('document_test', {});

				await doc.remove();

				expect(SchemaMock.ExecutePostHooksSpy).not.toHaveBeenCalled();
				expect(SchemaMock.ExecutePreHooksSpy).not.toHaveBeenCalled();
			});
		});
	});

	describe('Method save', () => {
		it('Should call the get collection/save/isValid/sanitizeData', async () => {
			SchemaMock.schemaObject = { testField: { type: 'object' } };
			const data = {
					testField: { name: 'test' }
				},
				doc = Document('document_test', data, new Schema({ testField: { type: 'object' } }));

			const result = await doc.save();

			expect(MongoInstanceMock.GetCollectionSpy).toBeCalledTimes(1);
			expect(SchemaMock.IsValidSpy).toHaveBeenNthCalledWith(1, data);
			expect(SchemaMock.SanitizeDataSpy).toHaveBeenNthCalledWith(1, data);
			expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
				1,
				{ _id: doc.data._id },
				{ $set: { _id: doc.data._id, testField: { name: 'test' } } },
				{ upsert: true }
			);
			expect(result).toEqual(doc);
		});

		it('Should not call the isValid/sanitizeData if not schema provided', async () => {
			const data = {
					testField: { name: 'test' }
				},
				doc = Document('document_test', data);

			const result = await doc.save();

			expect(MongoInstanceMock.GetCollectionSpy).toBeCalledTimes(1);
			expect(SchemaMock.IsValidSpy).not.toHaveBeenCalled();
			expect(SchemaMock.SanitizeDataSpy).not.toHaveBeenCalled();
			expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
				1,
				{ _id: doc.data._id },
				{ $set: { _id: doc.data._id, testField: { name: 'test' } } },
				{ upsert: true }
			);
			expect(result).toEqual(doc);
		});

		describe('When schema is present', () => {
			it('Should call the pre/post hooks', async () => {
				const schema = new Schema(),
					callbackHookSpy = jest.fn(),
					doc = Document('document_test', {}, schema);

				schema.pre('save', function() {
					callbackHookSpy();
				});

				schema.post('save', function() {
					callbackHookSpy();
				});

				await doc.save();

				expect(SchemaMock.PreHookSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
				expect(SchemaMock.PostHookSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
				expect(callbackHookSpy).toHaveBeenCalledTimes(2);
				expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Object));
				expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Object));
			});
		});

		describe('When schema is not present', () => {
			it('Should not call the execute pre/post hooks', async () => {
				const doc = Document('document_test', {});

				await doc.save();

				expect(SchemaMock.ExecutePostHooksSpy).not.toHaveBeenCalled();
				expect(SchemaMock.ExecutePreHooksSpy).not.toHaveBeenCalled();
			});
		});
	});

	describe('Method lean', () => {
		it('Should return the data field', () => {
			const doc = Document('document_test', { testField: { name: 'test' } }, new Schema({}));

			expect(doc.lean()).toEqual({ testField: { name: 'test' } });
		});
	});
});
