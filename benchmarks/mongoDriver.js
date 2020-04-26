'use strict';

const mongoClient = require('../lib/index').MongoClient,
	Model = require('../lib/index').Model,
	Schema = require('../lib/index').Schema;

async function setupDatabase(uri, databaseName) {
	return mongoClient.connect(uri, databaseName, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function saveBenchmark(number) {
	const promises = [],
		model = Model('mongoClient');

	for (let i = 0; i < number; i++) {
		const doc = model.instance({ data: i });

		promises.push(doc.save());
	}

	return Promise.all(promises);
}

async function saveBenchmarkWithHooks(number) {
	const promises = [],
		schema = new Schema(),
		model = Model('mongoClientHooks', schema);

	let counter = 0;

	schema.pre('save', function() {
		counter++;
	});

	schema.post('save', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		const doc = model.instance({ data: i });
		promises.push(doc.save());
	}

	return Promise.all(promises);
}

async function createBenchmark(number) {
	const promises = [],
		model = Model('mongoClient');

	for (let i = 0; i < number; i++) {
		promises.push(model.create({ data: i }));
	}

	return Promise.all(promises);
}

async function createBenchmarkWithHooks(number) {
	const promises = [],
		schema = new Schema(),
		model = Model('mongoClientHooks', schema);

	let counter = 0;

	schema.pre('save', function() {
		counter++;
	});

	schema.post('save', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		promises.push(model.create({ data: i }));
	}

	return Promise.all(promises);
}

async function deleteOneBenchmark(number) {
	const promises = [],
		model = Model('mongoClient');

	for (let i = 0; i < number; i++) {
		promises.push(model.deleteOne({}));
	}

	return Promise.all(promises);
}

async function deleteOneBenchmarkWithHooks(number) {
	const promises = [],
		schema = new Schema(),
		model = Model('mongoClientHooks', schema);

	let counter = 0;

	schema.pre('save', function() {
		counter++;
	});

	schema.post('save', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		promises.push(model.deleteOne({}));
	}

	return Promise.all(promises);
}

async function findOneBenchmark(number) {
	const promises = [],
		model = Model('mongoClient');

	for (let i = 0; i < number; i++) {
		promises.push(model.findOne({}));
	}

	return Promise.all(promises);
}

async function updateOneBenchmark(number) {
	const promises = [],
		model = Model('mongoClient');

	for (let i = 0; i < number; i++) {
		promises.push(model.updateOne({}, { newData: 'data' }));
	}

	return Promise.all(promises);
}

async function updateOneBenchmarkWithHooks(number) {
	const promises = [],
		schema = new Schema(),
		model = Model('mongoClientHooks', schema);

	let counter = 0;

	schema.pre('save', function() {
		counter++;
	});

	schema.post('save', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		promises.push(model.updateOne({}, { newData: 'data' }));
	}

	return Promise.all(promises);
}

module.exports = {
	setupDatabase,
	saveBenchmark,
	saveBenchmarkWithHooks,
	createBenchmark,
	createBenchmarkWithHooks,
	deleteOneBenchmark,
	deleteOneBenchmarkWithHooks,
	findOneBenchmark,
	findOneBenchmark,
	updateOneBenchmark,
	updateOneBenchmarkWithHooks
};
