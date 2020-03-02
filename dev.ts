import { Schema, MongoDriver, Model, Document } from './index';
import pino from 'pino';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

const logger = pino({ prettyPrint: { colorize: true } });
const mongodb = new MongoMemoryServer();

function setupDatabase(uri: string, database: string) {
	return MongoDriver.connect(uri, database, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function Playground() {
	try {
		const uri = await mongodb.getUri(),
			dbName = await mongodb.getDbName();

		await setupDatabase(uri, dbName);

		logger.info('Database is setup and running');

		const userModel = Model('user');
		const data = await userModel.create({ username: 'George Kampitakis' }); //TODO: lean option

		console.log(data);
		logger.info(data);
	} catch (error) {
		logger.error(error);
	}
}

Playground();
