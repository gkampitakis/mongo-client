import { Model } from './Model';
import { Schema } from '../Schema/Schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongodb, { Db, MongoClient, ObjectID } from 'mongodb';

jest.mock('../Document/Document');
jest.mock('../Schema/Schema');
jest.mock('../Utils/Utils');
jest.mock('../MongoInstance/MongoInstance');

describe('Model', () => {
  const { DocumentSpy } = jest.requireMock('../Document/Document'),
    { ObjectIdSpy, IsEmptyObjectSpy } = jest.requireMock('../Utils/Utils'),
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

  beforeEach(async () => {
    DocumentSpy.mockClear();
    SchemaMock.SetupCollectionSpy.mockClear();
    SchemaMock.SanitizeDataSpy.mockClear();
    SchemaMock.IsValidSpy.mockClear();
    MongoInstanceMock.GetCollectionSpy.mockClear();
    MongoInstanceMock.GetCollectionNameSpy.mockClear();
    ObjectIdSpy.mockClear();
    IsEmptyObjectSpy.mockClear();

    MongoInstanceMock.throwError = false;

    /**Mongo DB operations Spies */
    MongoInstanceMock.InsertOneSpy.mockClear();
    MongoInstanceMock.FindOneAndUpdateSpy.mockClear();
    MongoInstanceMock.FindOneSpy.mockClear();
  });

  describe('Constructor', () => {
    it('Should call the prepare collection if it/s the 1st time', done => {
      const schema = new Schema({});

      Model('test', schema);

      setTimeout(() => {
        expect(SchemaMock.SetupCollectionSpy).toHaveBeenNthCalledWith(1, 'test', expect.any(Db));
        done();
      }, 1000);
    });

    it('Should not call again the prepare collection for same collection', done => {
      const schema = new Schema({});

      Model('cache', schema);
      Model('cache', schema);

      setTimeout(() => {
        expect(SchemaMock.SetupCollectionSpy).toHaveBeenCalledTimes(1);
        done();
      }, 1000);
    });
  });

  describe('Method instance', () => {
    it('Should call the document function', () => {
      const schema = new Schema({}),
        testModel = Model('test', schema),
        data = { test: 'Data' },
        document = testModel.instance(data);

      expect(document.data).toEqual(data);
      expect(DocumentSpy).toHaveBeenNthCalledWith(1, 'test', data, schema);
    });
  });

  describe('Method create', () => {
    it('Should call the document function', async () => {
      const schema = new Schema({}),
        testModel = Model('test1', schema),
        data = { test: 'Data' },
        document = await testModel.create(data);

      expect(document).toEqual({
        data: { _id: expect.any(String), ...data },
        collectionName: 'test1'
      });
      expect(MongoInstanceMock.GetCollectionSpy).toHaveBeenCalledTimes(1);
      expect(DocumentSpy).toHaveBeenNthCalledWith(1, 'test1', data, schema);
      expect(MongoInstanceMock.InsertOneSpy).toHaveBeenNthCalledWith(1, data);
    });
  });

  describe('Method deleteMany', () => {
    it('should call the deleteMany mongo function', async () => {
      const schema = new Schema({}),
        testModel = Model('test1', schema);

      await testModel.deleteMany({});

      expect(MongoInstanceMock.DeleteManySpy).toHaveBeenNthCalledWith(1, {});
    });
  });

  describe('Method findByIdAndUpdate', () => {
    it('Should return null if not found', async () => {
      const schema = new Schema({}),
        testModel = Model('test2', schema);

      const result = await testModel.findByIdAndUpdate('5e4acf03d8e9435b2a2640ae', { test: 'test' }, { upsert: false });

      expect(SchemaMock.SanitizeDataSpy).toHaveBeenNthCalledWith(1, { test: 'test' });
      expect(IsEmptyObjectSpy).toHaveBeenNthCalledWith(1, { test: 'test' });
      expect(SchemaMock.IsValidSpy).toHaveBeenNthCalledWith(1, { test: 'test' }, true);
      expect(MongoInstanceMock.GetCollectionSpy).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
      expect(MongoInstanceMock.FindOneAndUpdateSpy).toHaveBeenNthCalledWith(
        1,
        { _id: new ObjectID('5e4acf03d8e9435b2a2640ae') },
        { $set: { test: 'test' } },
        { upsert: false }
      );
    });

    it('Should return null if empty object is provided', async () => {
      const schema = new Schema({}),
        testModel = Model('test2', schema);

      const result = await testModel.findByIdAndUpdate('5e4acf03d8e9435b2a2640ae', {}, { upsert: false });
      expect(SchemaMock.SanitizeDataSpy).toHaveBeenNthCalledWith(1, {});
      expect(IsEmptyObjectSpy).toHaveBeenNthCalledWith(1, {});
      expect(SchemaMock.IsValidSpy).toHaveBeenCalledTimes(0);
      expect(MongoInstanceMock.GetCollectionSpy).toHaveBeenCalledTimes(0);
      expect(result).toBeNull();
      expect(MongoInstanceMock.FindOneAndUpdateSpy).toHaveBeenCalledTimes(0);
    });

    it('Should return a wrapped object', async () => {
      const schema = new Schema({}),
        testModel = Model('test2', schema),
        data = { test: 'test' },
        updatedData = { test: 'test2' };

      const result = await testModel.create(data);

      MongoInstanceMock.GetCollectionSpy.mockClear();

      await testModel.findByIdAndUpdate(result.data._id as string, updatedData);

      expect(result).toEqual({
        data: { _id: expect.any(String), ...data },
        collectionName: 'test2'
      });
      expect(MongoInstanceMock.GetCollectionSpy).toHaveBeenCalledTimes(1);
      expect(MongoInstanceMock.FindOneAndUpdateSpy).toHaveBeenNthCalledWith(
        1,
        { _id: new ObjectID(result.data._id) },
        { $set: { test: 'test2' } },
        undefined
      );
    });
  });

  describe('Method findById ', () => {
    it('Should call the objectId', async () => {
      const schema = new Schema({}),
        testModel = Model('test3', schema);

      await testModel.findById('5e4acf03d8e9435b2a2640ae');

      expect(MongoInstanceMock.GetCollectionSpy).toHaveBeenCalledTimes(1);
      expect(ObjectIdSpy).toHaveBeenNthCalledWith(1, '5e4acf03d8e9435b2a2640ae');
      expect(MongoInstanceMock.FindOneSpy).toHaveBeenNthCalledWith(1, {
        _id: new ObjectID('5e4acf03d8e9435b2a2640ae')
      });
    });
  });

  describe('Method findOne', () => {
    it("Should return null if the doc doesn't exist and not proceed", async () => {
      const schema = new Schema({}),
        testModel = Model('test4', schema);

      const result = await testModel.findOne({ name: 'name' });

      expect(result).toBeNull();
      expect(MongoInstanceMock.GetCollectionSpy).toHaveBeenCalledTimes(1);
      expect(DocumentSpy).toHaveBeenCalledTimes(0);
      expect(MongoInstanceMock.FindOneSpy).toHaveBeenNthCalledWith(1, { name: 'name' });
    });

    it('Should return a wrapped document', async () => {
      const schema = new Schema({}),
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
  });
});
