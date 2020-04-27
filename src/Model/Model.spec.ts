import { Model } from './Model';
import { Schema } from '../Schema/Schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongodb, { MongoClient, ObjectID } from 'mongodb';
import { Document } from '../Document/Document';

jest.mock('../Document/Document');
jest.mock('../Schema/Schema');
jest.mock('../Utils/Utils');
jest.mock('../MongoInstance/MongoInstance');

describe('Model', () => {
	const { DocumentSpy } = jest.requireMock('../Document/Document'),
		{ ObjectIdSpy, IsEmptyObjectSpy, ExtractUniqueValuesSpy, ObjectEqualitySpy } = jest.requireMock(
			'../Utils/Utils'
		),
		SchemaMock = jest.requireMock('../Schema/Schema').Schema,
		MongoInstanceMock = jest.requireMock('../MongoInstance/MongoInstance').MongoInstance;

	let mongod: MongoMemoryServer, ClientConnection;

	beforeAll(async done => {
		mongod = new MongoMemoryServer();

		const mongoURI = await mongod.getUri(),
			dbName = await mongod.getDbName();

		mongodb.connect(mongoURI, { useUnifiedTopology: true }).then((client: MongoClient) => {
			ClientConnection = client.db(dbName);
			done();
		});
	});

	afterAll(async done => {
		await mongod.stop();

		done();
	});

	beforeEach(async () => {
		DocumentSpy.mockClear();
		SchemaMock.ExecutePreHooksSpy.mockClear();
		SchemaMock.ExecutePostHooksSpy.mockClear();
		SchemaMock.ValidateSpy.mockClear();
		MongoInstanceMock.GetCollectionNameSpy.mockClear();
		ObjectIdSpy.mockClear();
		IsEmptyObjectSpy.mockClear();
		ExtractUniqueValuesSpy.mockClear();
		ObjectEqualitySpy.mockClear();

		MongoInstanceMock.throwError = false;

		/**Mongo DB operations Spies */
		MongoInstanceMock.InsertOneSpy.mockClear();
		MongoInstanceMock.UpdateOneSpy.mockClear();
		MongoInstanceMock.FindOneSpy.mockClear();
		MongoInstanceMock.DeleteOneSpy.mockClear();
		MongoInstanceMock.FindSpy.mockClear();

		SchemaMock.schemaDefinition = {};
		SchemaMock.HasHooks = true;
		MongoInstanceMock.database = ClientConnection;
	});

	describe('Constructor', () => {
		it("Should call the prepare collection if it's the 1st time", done => {
			const schema = new Schema();

			Model('test', schema);

			setTimeout(() => {
				expect(ExtractUniqueValuesSpy).toHaveBeenNthCalledWith(1, {});
				done();
			}, 1000);
		});

		it('Should not call again the prepare collection for same collection', done => {
			const schema = new Schema();

			Model('test', schema);

			expect(ExtractUniqueValuesSpy).toHaveBeenCalledTimes(0);
			done();
		});

		it('Should not call the prepare collection if no schema is given', done => {
			SchemaMock.schemaDefinition = undefined;

			Model('noSchema', new Schema());

			setTimeout(() => {
				expect(ExtractUniqueValuesSpy).toHaveBeenCalledTimes(0);
				done();
			}, 1000);
		});

		it('Should call setInterval if no connection established and then resolve', done => {
			MongoInstanceMock.database = undefined;

			const SetIntervalSpy = jest.spyOn(window, 'setInterval'),
				ClearIntervalSpy = jest.spyOn(window, 'clearInterval');
			Model('noSchema', new Schema());

			expect(SetIntervalSpy).toHaveBeenCalled();
			MongoInstanceMock.database = ClientConnection;

			setTimeout(() => {
				expect(ClearIntervalSpy).toHaveBeenCalledTimes(1);
				done();
			}, 1500);
		});
	});

	describe('Method instance', () => {
		it('Should call the document function', () => {
			const schema = new Schema(),
				testModel = Model('test', schema),
				data = { test: 'Data' },
				document = testModel.instance(data);

			expect(document.data).toEqual(data);
			expect(DocumentSpy).toHaveBeenNthCalledWith(1, 'test', data, schema);
		});
	});

	describe('Method create', () => {
		it('Should call the document function', async () => {
			SchemaMock.schemaDefinition = undefined;

			const schema = new Schema(),
				testModel = Model('test1', schema),
				data = { test: 'Data' },
				document = await testModel.create(data);

			expect(document).toEqual({
				data: { _id: expect.any(String), ...data },
				collectionName: 'test1'
			});
			expect(DocumentSpy).toHaveBeenNthCalledWith(1, 'test1', data, schema);
			expect(MongoInstanceMock.InsertOneSpy).toHaveBeenNthCalledWith(1, data);
		});

		it('Should return a non wrapped object if option is lean', async () => {
			const schema = new Schema(),
				testModel = Model('wrappedTest', schema),
				data = { test: 'Data' },
				document = await testModel.create(data, true);

			expect(document).not.toBeInstanceOf(Document);
			expect(document).toEqual(data);
			expect(DocumentSpy).not.toHaveBeenCalled();
		});

		it('Should call execute pre/post hooks if schema provided', async () => {
			const testModel = Model('CreateModel', new Schema()),
				data = { test: 'test' };

			const doc = await testModel.create(data);

			expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(
				1,
				'create',
				{ collectionName: 'CreateModel', data: { ...data, _id: doc.data._id } },
				false
			);
			expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(
				1,
				'create',
				{ collectionName: 'CreateModel', data: { ...data, _id: doc.data._id } },
				false
			);
			expect(MongoInstanceMock.InsertOneSpy).toHaveBeenCalled();
		});

		it('Should not call execute pre/post hooks if schema not provided', async () => {
			const testModel = Model('CreateModel1'),
				data = { test: 'test' };

			await testModel.create(data);

			expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenCalledTimes(0);
			expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenCalledTimes(0);
			expect(MongoInstanceMock.InsertOneSpy).toHaveBeenCalled();
		});

		it('Should throw error', () => {
			MongoInstanceMock.throwError = true;

			const testModel = Model('test', new Schema());

			expect(testModel.create({})).rejects.toThrowError('MockError');
		});
	});

	describe('Method deleteMany', () => {
		it('should call the deleteMany mongo function', async () => {
			const schema = new Schema(),
				testModel = Model('test1', schema);

			const res = await testModel.deleteMany({});

			expect(MongoInstanceMock.DeleteManySpy).toHaveBeenNthCalledWith(1, {});
			expect(res).toBeUndefined;
		});

		it('Should throw Error', async () => {
			MongoInstanceMock.throwError = true;

			const testModel = Model('test');

			expect(testModel.deleteMany({})).rejects.toThrowError('MockError');
		});
	});

	describe('Method UpdateOne', () => {
		it('Should return null if not found', async () => {
			const schema = new Schema(),
				testModel = Model('test2', schema);
			const result = await testModel.updateOne({ _id: '5e4acf03d8e9435b2a2640ae' }, { test: 'test' });

			expect(MongoInstanceMock.FindOneSpy).toHaveBeenNthCalledWith(1, {
				_id: '5e4acf03d8e9435b2a2640ae'
			});
			expect(result).toBeNull();
		});
		it('Should return the same document if no updates are made', async () => {
			const schema = new Schema(),
				testModel = Model('test2', schema);

			const doc = await testModel.create({ test: 'test' }, true);

			const result = await testModel.updateOne({ _id: doc._id }, {});

			expect(SchemaMock.ValidateSpy).toHaveBeenCalledTimes(1);
			expect(ObjectEqualitySpy).toHaveBeenCalledTimes(1);
			expect(result).toEqual({ _id: doc._id, test: 'test' });
			expect(MongoInstanceMock.FindOneSpy).toHaveBeenCalledTimes(1);
		});
		it('Should return a wrapped object', async () => {
			const schema = new Schema(),
				testModel = Model('test2', schema),
				data = { test: 'test' },
				updatedData = { test: 'test2' };
			const doc = await testModel.create(data, true);

			const result = await testModel.updateOne({ _id: doc._id }, updatedData);

			expect(result).toHaveProperty('collectionName');
			expect(result.data).toEqual({
				_id: doc._id,
				...updatedData
			});
			expect(MongoInstanceMock.FindOneSpy).toHaveBeenNthCalledWith(1, { _id: new ObjectID(doc._id) });
			expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
				1,
				{ _id: new ObjectID(doc._id) },
				{ $set: { test: 'test2' } }
			);
		});
		it('Should not call the validate and just pass raw data if no schema', async () => {
			const testModel = Model('NoSchema'),
				data = { test: 'test' },
				updatedData = { test: { test: 'test' } };
			const result = await testModel.create(data, true);
			SchemaMock.ValidateSpy.mockClear();
			await testModel.updateOne({ _id: result._id }, updatedData);
			expect(SchemaMock.ValidateSpy).toHaveBeenCalledTimes(0);
			expect(ObjectEqualitySpy).toHaveBeenCalledTimes(1);
			expect(MongoInstanceMock.FindOneSpy).toHaveBeenNthCalledWith(1, { _id: new ObjectID(result._id) });
			expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
				1,
				{ _id: new ObjectID(result._id) },
				{ $set: { test: { test: 'test' } } }
			);
		});

		it('Should throw error', async () => {
			const model = Model('test');

			MongoInstanceMock.throwError = true;

			expect(model.updateOne({ _id: '321331' }, {})).rejects.toThrowError('MockError');
		});

		describe('Pre/post hooks', () => {
			it('Should execute them if schema provided with plain object', async () => {
				const testModel = Model('Schema', new Schema()),
					data = { test: 'test' },
					updatedData = { test: { test: 'test' } };

				const doc = await testModel.create(data, true);

				SchemaMock.ExecutePostHooksSpy.mockClear();
				SchemaMock.ExecutePreHooksSpy.mockClear();

				await testModel.updateOne({ _id: doc._id }, updatedData, true);

				expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(
					1,
					'update',
					{
						_id: doc._id,
						test: 'test'
					},
					true
				);
				expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(
					1,
					'update',
					{
						_id: doc._id,
						test: { test: 'test' }
					},
					true
				);
				expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
					1,
					{ _id: doc._id },
					{ $set: updatedData }
				);
			});

			it('Should execute them if schema provided with document', async () => {
				const testModel = Model('Schema', new Schema()),
					data = { test: 'test' },
					updatedData = { test: { test: 'test' } };

				const doc = await testModel.create(data, true);

				SchemaMock.ExecutePostHooksSpy.mockClear();
				SchemaMock.ExecutePreHooksSpy.mockClear();

				await testModel.updateOne({ _id: doc._id }, updatedData);

				expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(
					1,
					'update',
					{
						collectionName: 'Schema',
						data: { _id: doc._id, test: 'test' }
					},
					false
				);
				expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(
					1,
					'update',
					{
						collectionName: 'Schema',
						data: { _id: doc._id, test: { test: 'test' } }
					},
					false
				);
				expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
					1,
					{ _id: doc._id },
					{ $set: updatedData }
				);
			});

			it('Should not execute if schema not provided', async () => {
				const testModel = Model('NoSchema'),
					data = { test: 'test' },
					updatedData = { test: { test: 'test' } };

				const doc = await testModel.create(data, true);

				SchemaMock.ExecutePostHooksSpy.mockClear();
				SchemaMock.ExecutePreHooksSpy.mockClear();

				await testModel.updateOne({ _id: doc._id }, updatedData);

				expect(SchemaMock.ExecutePostHooksSpy).not.toHaveBeenCalled();
				expect(SchemaMock.ExecutePreHooksSpy).not.toHaveBeenCalled();
				expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenCalled();
			});
		});
	});

	describe('Method findById ', () => {
		it('Should call findOne', async () => {
			const schema = new Schema(),
				testModel = Model('test3', schema),
				FindOneSpy = jest.spyOn(testModel, 'findOne');

			await testModel.findById('5e4acf03d8e9435b2a2640ae');

			expect(FindOneSpy).toHaveBeenNthCalledWith(
				1,
				{
					_id: '5e4acf03d8e9435b2a2640ae'
				},
				false
			);
		});
	});

	describe('Method findOne', () => {
		it("Should return null if the doc doesn't exist and not proceed", async () => {
			const schema = new Schema(),
				testModel = Model('test4', schema);

			const result = await testModel.findOne({ name: 'name' });

			expect(result).toBeNull();
			expect(DocumentSpy).toHaveBeenCalledTimes(0);
			expect(MongoInstanceMock.FindOneSpy).toHaveBeenNthCalledWith(1, { name: 'name' });
		});

		it('Should return a wrapped document', async () => {
			const schema = new Schema(),
				testModel = Model('test5', schema),
				data = { test: 'test' };

			const result = await testModel.create(data);
			DocumentSpy.mockClear();

			await testModel.findOne({ _id: result.data._id });

			expect(DocumentSpy).toHaveBeenCalledTimes(1);
			expect(result).toEqual({
				data,
				collectionName: 'test5'
			});
			expect(MongoInstanceMock.InsertOneSpy).toHaveBeenNthCalledWith(1, {
				_id: new ObjectID(result.data._id),
				test: 'test'
			});
		});

		it('Should not return a wrapped document if option lean', async () => {
			const schema = new Schema(),
				testModel = Model('test6', schema),
				data = { test: 'test' };

			const result = await testModel.create(data);
			DocumentSpy.mockClear();

			const doc = await testModel.findOne({ _id: result.data._id }, true);

			expect(DocumentSpy).toHaveBeenCalledTimes(0);
			expect(doc).toEqual({ ...data, _id: result.data._id });
			expect(doc).not.toBeInstanceOf(Document);
		});

		it('Should reject error', async () => {
			const testModel = Model('test');

			MongoInstanceMock.throwError = true;

			try {
				await testModel.findOne({});
			} catch (error) {
				expect(error.message).toBe('MockError');
			}
		});
	});

	describe('Method deleteOne', () => {
		it('Should call deleteOne function and the execute pre/post hook with a wrapped document', async () => {
			const schema = new Schema(),
				testModel = Model('test6', schema);

			const doc = await testModel.create({ field: 'test' }, true);

			SchemaMock.ExecutePreHooksSpy.mockClear();
			SchemaMock.ExecutePostHooksSpy.mockClear();

			await testModel.deleteOne({ _id: doc._id }, true);

			expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(
				1,
				'delete',
				{ field: 'test', _id: doc._id },
				true
			);
			expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(
				1,
				'delete',
				{ field: 'test', _id: doc._id },
				true
			);
			expect(MongoInstanceMock.DeleteOneSpy).toHaveBeenNthCalledWith(1, { _id: doc._id });
		});

		it('Should call the execute pre/post hook with a plain object', async () => {
			const schema = new Schema(),
				testModel = Model('test6', schema);

			const doc = await testModel.create({ field: 'test' }, true);

			SchemaMock.ExecutePreHooksSpy.mockClear();
			SchemaMock.ExecutePostHooksSpy.mockClear();

			await testModel.deleteOne({ _id: doc._id }, false);
			expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(
				1,
				'delete',
				{ collectionName: 'test6', data: { field: 'test', _id: doc._id } },
				false
			);
			expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(
				1,
				'delete',
				{ collectionName: 'test6', data: { field: 'test', _id: doc._id } },
				false
			);
			expect(MongoInstanceMock.DeleteOneSpy).toHaveBeenNthCalledWith(1, { _id: doc._id });
		});

		it('Should return null if document not found', async () => {
			const schema = new Schema(),
				testModel = Model('test6', schema);

			const result = await testModel.deleteOne({ _id: '5e4acf03d8e9435b2a2640ae' }, false);

			expect(result).toBeNull();
		});

		describe('when no hooks registered', () => {
			it('Should not call the execute pre/post hook', async () => {
				const schema = new Schema(),
					testModel = Model('test6', schema);

				SchemaMock.HasHooks = false;

				const doc = await testModel.create({ field: 'test' }, true);

				SchemaMock.ExecutePreHooksSpy.mockClear();
				SchemaMock.ExecutePostHooksSpy.mockClear();

				await testModel.deleteOne({ _id: doc._id }, false);
				expect(SchemaMock.ExecutePreHooksSpy).not.toHaveBeenCalled();
				expect(SchemaMock.ExecutePostHooksSpy).not.toHaveBeenCalled();
				expect(MongoInstanceMock.DeleteOneSpy).toHaveBeenNthCalledWith(1, { _id: doc._id });
			});
		});
	});
	describe('Method findByIdAndDelete', () => {
		it('Should call the deleteOne method', async () => {
			const model = Model('test'),
				doc = await model.create({ field: 'test' }, true),
				DeleteOneSpy = jest.spyOn(model, 'deleteOne');

			SchemaMock.ExecutePreHooksSpy.mockClear();
			SchemaMock.ExecutePostHooksSpy.mockClear();

			await model.findByIdAndDelete(doc._id);

			expect(DeleteOneSpy).toHaveBeenNthCalledWith(1, { _id: doc._id }, false);
		});
	});
	describe('Method findByIdAndUpdate', () => {
		it('Should call the updateOne', async () => {
			const model = Model('test'),
				UpdateOneSpy = jest.spyOn(model, 'updateOne');

			await model.findByIdAndUpdate('1233131', {});

			expect(UpdateOneSpy).toHaveBeenNthCalledWith(1, { _id: '1233131' }, {}, false);
		});
	});

	describe('Method find', () => {
		it('Should call the native find method', async () => {
			const model = Model('test');

			await model.find({}, {});

			expect(MongoInstanceMock.FindSpy).toHaveBeenNthCalledWith(1, {}, {});
		});
	});
});
