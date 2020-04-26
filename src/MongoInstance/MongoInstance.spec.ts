import { MongoInstance } from './MongoInstance';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongodb, { Db, MongoClient } from 'mongodb';
import { Schema } from '../Schema/Schema';

class Test extends MongoInstance {
	constructor(collectionName: string, db?: Db) {
		if (db) MongoInstance.setDb(db);
		super(collectionName, {} as Schema);
	}

	public getCollectionTest() {
		return this.collection;
	}
}

describe('MongoInstance', () => {
	it('Should throw an error if the database is not initialized', () => {
		const test = new Test('testCollection');

		expect(() => test.getCollectionTest()).toThrowError('MongoClient not correctly initialized');
	});

	it('Should return the collection', async done => {
		const mongod = new MongoMemoryServer(),
			mongoURI = await mongod.getUri(),
			dbName = await mongod.getDbName();

		mongodb.connect(mongoURI, { useUnifiedTopology: true }).then(async (client: MongoClient) => {
			const test2 = new Test('test', client.db(dbName));

			expect(() => test2.getCollectionTest()).not.toThrowError();

			await mongod.stop();

			done();
		});
	});
});
