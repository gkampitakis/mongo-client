import { MongoDriver } from './index';
import mongoLocal from 'mongodb';
import pino from 'pino';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
	createMethod,
	deleteManyMethod,
	deleteOneMethod,
	findByIdAndUpdateMethod,
	findByIdMethod,
	findOneMethod,
	instanceMethod
} from './playground/';

const logger = pino({ prettyPrint: { colorize: true } }),
	mongoServer = process.argv[3] === 'server',
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

		await createMethod(); //DONE
		await deleteManyMethod(); //DONE
		await deleteOneMethod(); //DONE
		await findByIdAndUpdateMethod();//DONE
		await findByIdMethod(); //DONE
		await findOneMethod();//DONE
		await instanceMethod();
	} catch (error) {
		logger.error(error);
	}
}

//check the validate as well and through robo mongo how we do changes
//TODO: document

Playground();
