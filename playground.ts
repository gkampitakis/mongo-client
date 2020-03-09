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
	mongoServer = process.argv[0] === 'server',
	mongodb = new MongoMemoryServer();

function setupDatabase(uri: string, database: string) {
	return MongoDriver.connect(uri, database, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function Playground() {
	try {
		const uri = mongoServer ? await mongodb.getUri() : 'mongodb://localhost:27017',
			dbName = mongoServer ? await mongodb.getDbName() : 'playground';

		await setupDatabase(uri, dbName);

		logger.info('Database is setup and running');

		await createMethod(); //DONE
		await deleteManyMethod(); //DONE
		await deleteOneMethod(); //DONE
		await findByIdAndUpdateMethod();
		await findByIdMethod();
		await findOneMethod();
		await instanceMethod();
	} catch (error) {
		logger.error(error);
	}
}

async function testingFunctionality() {
	//Check the hooks as well with the lean option and not
	//Method findbyid check the return values
	//check the lean option
	//and the hooks
	//check as well if we change the pre hook data will affect the update data as well or else fix it
	//check the validate as well and through robo mongo how we do changes
	//Method findbyId same as findOne the lean option and returned values
	//TODO: document
}

Playground();
