import { MongoDriver } from './MongoDriver';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../MongoInstance/MongoInstance');

describe('MongoDriver', () => {
  const MongoInstanceMock = jest.requireMock('../MongoInstance/MongoInstance').MongoInstance;

  beforeEach(() => {
    MongoInstanceMock.SetDbSpy.mockClear();
  });

  describe('Method connect', () => {
    it('Should call the MongoInstance setDb', async done => {
      const mongod = new MongoMemoryServer(),
        mongoURI = await mongod.getUri(),
        dbName = await mongod.getDbName();

      MongoDriver.connect(mongoURI, dbName).then(async () => {
        expect(MongoInstanceMock.SetDbSpy).toHaveBeenCalledTimes(1);

        await mongod.stop();

        done();
      });
    });
  });
});
