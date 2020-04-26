'use strict';

const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer,
	{
		setupDatabase,
		deleteOneBenchmark,
		createBenchmark,
		createBenchmarkWithHooks,
		deleteOneBenchmarkWithHooks,
		findOneBenchmark,
		saveBenchmark,
		saveBenchmarkWithHooks,
		updateOneBenchmark,
		updateOneBenchmarkWithHooks
	} = require('./mongoClient'),
	{
		setupDatabase: setupNative,
		insertBenchmark: insertNative,
		deleteOneBenchmark: deleteOneNative,
		findOneBenchmark: findOneNative,
		updateOneBenchmark: updateOneNative
	} = require('./mongoNative'),
	{
		setupDatabase: setupMongoose,
		deleteOneBenchmark: deleteOneMongoose,
		deleteOneBenchmarkWithHooks: deleteOneMongooseWithHooks,
		findOneBenchmark: findOneMongoose,
		saveBenchmark: saveMongoose,
		saveBenchmarkWithHooks: saveMongooseWithHooks,
		updateOneBenchmark: updateOneMongoose,
		updateOneBenchmarkWithHooks: updateOneMongooseWithHooks
	} = require('./mongoose'),
	mongoServer = new MongoMemoryServer(),
	logger = require('pino')({
		prettyPrint: {
			colorize: true,
			ignore: 'pid,hostname,time'
		}
	}),
	AsciiTable = require('ascii-table');

const INSERTS = 10000,
	DELETES = 10000,
	UPDATES = 10000,
	SEARCHES = 10000;

async function Main() {
	try {
		await setupDatabases();
		logger.info('Databases are initialized');

		await MongoClientBenchmarks();

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

async function MongoClientBenchmarks() {
	return benchmarkFunction('MongoClient', async registerTimer => {
		await createBenchmark(INSERTS);
		registerTimer('createBenchmark');
		await createBenchmarkWithHooks(INSERTS);
		registerTimer('createBenchmarkWithHooks');
		await saveBenchmark(INSERTS);
		registerTimer('saveBenchmark');
		await saveBenchmarkWithHooks(INSERTS);
		registerTimer('saveBenchmarkWithHooks');
		await findOneBenchmark(SEARCHES);
		registerTimer('findOneBenchmarks');
		await updateOneBenchmark(UPDATES);
		registerTimer('updateOneBenchmark');
		await updateOneBenchmarkWithHooks(UPDATES);
		registerTimer('updateOneBenchmarkWithHooks');
		await deleteOneBenchmark(DELETES);
		registerTimer('deleteOneBenchmark');
		await deleteOneBenchmarkWithHooks(DELETES);
		registerTimer('deleteOneBenchmarkWithHooks');
	});
}

async function MongoNativeBenchmarks() {
	return benchmarkFunction('Native', async registerTimer => {
		await insertNative(INSERTS);
		registerTimer('insertNative');
		await findOneNative(SEARCHES);
		registerTimer('findOneNative');
		await updateOneNative(UPDATES);
		registerTimer('updateOneNative');
		await deleteOneNative(DELETES);
		registerTimer('deleteOneNative');
	});
}

async function MongooseBenchmarks() {
	return benchmarkFunction('Mongoose', async registerTimer => {
		await saveMongoose(INSERTS);
		registerTimer('saveMongoose');
		await saveMongooseWithHooks(INSERTS);
		registerTimer('saveMongooseWithHooks');
		await findOneMongoose(SEARCHES);
		registerTimer('findOneMongoose');
		await updateOneMongoose(UPDATES);
		registerTimer('updateOneMongoose');
		await updateOneMongooseWithHooks(UPDATES);
		registerTimer('updateOneMongoose');
		await deleteOneMongoose(DELETES);
		registerTimer('deleteOneMongoose');
		await deleteOneMongooseWithHooks(DELETES);
		registerTimer('deleteOneMongooseWithHooks');
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
	printStatsTable(testedMethod, timers);
}

function printStatsTable(suite, data) {
	const table = new AsciiTable(suite);
	let i = 0;
	table.setHeading('', 'Method', 'Time');

	for (const datum in data) {
		table.addRow(i++, datum, data[datum]);
	}

	console.log(table.toString());
}
