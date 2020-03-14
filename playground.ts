import { MongoDriver } from './index';
import pino from 'pino';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
	createMethod,
	deleteManyMethod,
	deleteOneMethod,
	findByIdAndUpdateMethod,
	findByIdMethod,
	findOneMethod,
	instanceMethod,
	document
} from './playground/';

const logger = pino({
		prettyPrint: {
			colorize: true,
			ignore: 'pid,hostname,time'
		}
	}),
	mongoServer = process.argv[2] === 'server',
	mongodb = new MongoMemoryServer();

function setupDatabase(uri: string, database: string) {
	return MongoDriver.connect(uri, database, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function Playground() {
	try {
		const uri = !mongoServer ? await mongodb.getUri() : 'mongodb://localhost:27017',
			dbName = !mongoServer ? await mongodb.getDbName() : 'playground';

		await setupDatabase(uri, dbName);

		logger.info('Database is setup and running');

		await createMethod();
		await deleteManyMethod();
		await deleteOneMethod();
		await findByIdAndUpdateMethod();
		await findByIdMethod();
		await findOneMethod();
		await instanceMethod();
		await document(true);
	} catch (error) {
		logger.error(error);
	}
}

//check the validate as well and through robo mongo how we do changes

Playground();
