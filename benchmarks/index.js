const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer,
	{ setupDatabase, insertBenchmark } = require('./mongoDriver'),
	{ setupDatabase: setupNative, insertBenchmark: insertNative } = require('./mongoNative'),
	{ setupDatabase: setupMongoose, insertBenchmark: insertMongoose } = require('./mongoose'),
	mongoServer = new MongoMemoryServer(),
	logger = require('pino')({
		prettyPrint: { colorize: true }
	});

const INSERTS = 10000;

async function Main() {
	try {
		await setupDatabases();
		logger.info('Databases are initialized');

		logger.info('Running MongoDriver');

		await MongoDriverBenchmarks();

		await MongoNativeBenchmarks();

		await MongooseBenchmarks();

		logger.info('Finished');
		process.exit();
	} catch (error) {
		logger.error(error);
	}
}

async function setupDatabases() {
	const uri = await mongoServer.getUri(),
		dbName = await mongoServer.getDbName(),
		promises = [];

	promises.push(setupDatabase(uri, dbName));
	promises.push(setupNative(uri));
	promises.push(setupMongoose(uri));

	return Promise.all(promises);
}

async function MongoDriverBenchmarks() {
	const start = process.hrtime();
	return new Promise(async resolve => {
		await insertBenchmark(INSERTS);

		const end = process.hrtime(start);
		logger.warn('[MongoDriver] Benchmarks duration: %ds %dms', end[0], end[1] / 1000000);
		resolve();
	});
}

async function MongoNativeBenchmarks() {
	const start = process.hrtime();
	return new Promise(async resolve => {
		await insertNative(INSERTS);

		const end = process.hrtime(start);
		logger.warn('[Native] Benchmarks duration: %ds %dms', end[0], end[1] / 1000000);
		resolve();
	});
}

async function MongooseBenchmarks() {
	const start = process.hrtime();

	return new Promise(async resolve => {
		await insertMongoose(INSERTS);

		const end = process.hrtime(start);
		logger.warn('[Mongoose] Benchmarks duration: %ds %dms', end[0], end[1] / 1000000);
		resolve();
	});
}

Main();
