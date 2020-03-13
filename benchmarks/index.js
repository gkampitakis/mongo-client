'use strict';

const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer,
	{ setupDatabase, insertBenchmark, deleteOneBenchmark } = require('./mongoDriver'),
	{
		setupDatabase: setupNative,
		insertBenchmark: insertNative,
		deleteOneBenchmark: deleteOneNative
	} = require('./mongoNative'),
	{
		setupDatabase: setupMongoose,
		insertBenchmark: insertMongoose,
		deleteOneBenchmark: deleteOneMongoose
	} = require('./mongoose'),
	mongoServer = new MongoMemoryServer(),
	logger = require('pino')({
		prettyPrint: {
			colorize: true,
			ignore: 'pid,hostname,time'
		}
	});

const INSERTS = 10000,
	DELETES = 10000;

async function Main() {
	try {
		await setupDatabases();
		logger.info('Databases are initialized');

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
	return benchmarkFunction('MongoDriver', async registerTimer => {
		await insertBenchmark(INSERTS);
		registerTimer('insertBenchmark');
		await deleteOneBenchmark(DELETES);
		registerTimer('deleteOneBenchmark');
	});
}

async function MongoNativeBenchmarks() {
	return benchmarkFunction('Native', async registerTimer => {
		await insertNative(INSERTS);
		registerTimer('insertNative');
		await deleteOneNative(DELETES);
		registerTimer('deleteOneNative');
	});
}

async function MongooseBenchmarks() {
	return benchmarkFunction('Mongoose', async registerTimer => {
		await insertMongoose(INSERTS);
		registerTimer('insertMongoose');
		await deleteOneMongoose(DELETES);
		registerTimer('deleteOneMongoose');
	});
}

Main();

async function benchmarkFunction(testedMethod, callback) {
	const start = process.hrtime(),
		timers = {};

	let tempTimer = process.hrtime();

	function registerTimer(operation) {
		const timer = process.hrtime(tempTimer);
		timers[operation] = `${timer[0]}s ${timer[1] / 1000000}ms`;
		tempTimer = process.hrtime();
	}

	logger.info(`[${testedMethod}] Running...`);
	await callback(registerTimer);

	const end = process.hrtime(start);

	logger.info(`[${testedMethod}] Benchmarks duration: %ds %dms`, end[0], end[1] / 1000000);
	logger.info(timers);
}

//TODO: maybe we should have timers separately for each functionality
//TODO: deleteOne optimization and create the deleteById benchmark the deleteOne with hooks and not
