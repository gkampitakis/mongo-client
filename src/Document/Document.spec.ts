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
    MongoInstanceMock.GetCollectionSpy.mockClear();
    MongoInstanceMock.GetCollectionNameSpy.mockClear();
    ObjectIdSpy.mockClear();
    StripObjectSpy.mockClear();
    IsEmptyObjectSpy.mockClear();

    /**Mongo DB operations Spies */
    MongoInstanceMock.UpdateOneSpy.mockClear();
    MongoInstanceMock.DeleteOneSpy.mockClear();
  });

  describe('Constructor', () => {
    it('should call the stripObject/sanitizeData/isValid and return an object', () => {
      Document('document_test', {}, new Schema({}));

      expect(SchemaMock.IsValidSpy).toHaveBeenNthCalledWith(1, {});
      expect(SchemaMock.SanitizeDataSpy).toHaveBeenNthCalledWith(1, {});
      expect(StripObjectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Method remove', () => {
    it('placeholder', async () => {
      const doc = Document('document_test', {}, new Schema({}));

      await doc.save();

      await doc.remove();

      expect(MongoInstanceMock.DeleteOneSpy).toHaveBeenNthCalledWith(1, { _id: new ObjectID(doc.data._id) });
    });
  });

  describe('Method save', () => {
    it('Should call the get collection and save', async () => {
      const doc = Document('document_test', { testField: { name: 'test' } }, new Schema({}));

      await doc.save(); //BUG: the return value here

      expect(MongoInstanceMock.GetCollectionSpy).toBeCalledTimes(1);
      expect(MongoInstanceMock.UpdateOneSpy).toHaveBeenNthCalledWith(
        1,
        { _id: doc.data._id },
        { $set: { _id: doc.data._id, testField: { name: 'test' } } },
        { upsert: true }
      );
    });
  });

  describe('Method lean', () => {
    it('Should return the data field', () => {
      const doc = Document('document_test', { testField: { name: 'test' } }, new Schema({}));

      expect(doc.lean()).toEqual({ testField: { name: 'test' } });
    });
  });
});
