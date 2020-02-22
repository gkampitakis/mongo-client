import { Model } from './Model';
import { Schema } from '../Schema/Schema';
import { MongoDriver } from '../MongoDriver/MongoDriver';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db } from 'mongodb';

jest.mock('../Document/Document');
jest.mock('../Schema/Schema');

describe('Model', () => {
  const { DocumentSpy } = jest.requireMock('../Document/Document'),
    SchemaMock = jest.requireMock('../Schema/Schema').Schema;

  let mongod: MongoMemoryServer;

  beforeAll(async done => {
    mongod = new MongoMemoryServer();

    const mongoURI = await mongod.getUri(),
      dbName = await mongod.getDbName();

    await MongoDriver.connect(mongoURI, dbName, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    done();
  });

  afterAll(async done => {
    await MongoDriver.disconnect();
    await mongod.stop();

    done();
  });

  beforeEach(async () => {
    DocumentSpy.mockClear();
    SchemaMock.SetupCollectionSpy.mockClear();
  });

  describe('on model creation', () => {
    it('should call the setup collection if it/s the 1st time', done => {
      const schema = new Schema({});

      Model('test', schema);

      setTimeout(() => {
        expect(SchemaMock.SetupCollectionSpy).toHaveBeenNthCalledWith(1, 'test', expect.any(Db));
        done();
      }, 1000);
    });

    it('should not call again the prepare collection for same collection', done => {
      const schema = new Schema({});

      Model('cache', schema);
      Model('cache', schema);

      setTimeout(() => {
        expect(SchemaMock.SetupCollectionSpy).toHaveBeenCalledTimes(1);
        done();
      }, 1000);
    });
  });

  describe('Create a model instance', () => {
    it('should call the document function', () => {
      const schema = new Schema({}),
        testModel = Model('test', schema),
        data = { test: 'Data' },
        document = testModel.instance(data);

      expect(document.data).toEqual(data);
      expect(DocumentSpy).toHaveBeenNthCalledWith(1, 'test', data, schema);
    });
  });

  // it('expect', async () => {

  //   const test = Model('test', new Schema({ username: { type: 'string' } }));
  //   await test.instance({ username: 'George' });

  //   expect(DocumentSpy).toHaveBeenCalledTimes(1);

  // });
});

/**
 *
 *  > findOne
 *  > if the doc doesn't exist we don't call the document
 *  > else we call the document  function and resolve
 *
 *  > findById doesn't need testing
 *
 *  > findByIdAndUpdate
 *  > create mock objectID is called
 *  > sanitizeData is called
 *  > is empty object mock up
 *  > is valid is called
 *  > same as findOne
 *
 *
 *  > instance check if document is called with arguments
 *
 *  > Test the caching mechanism
 */
