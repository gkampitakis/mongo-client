'use strict';

const mongoDriver = require('../lib/index').MongoDriver,
	Model = require('../lib/index').Model;

async function setupDatabase(uri, databaseName) {
	return mongoDriver.connect(uri, databaseName, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function insertBenchmark(number) {
	const promises = [],
		model = Model('mongoDriver');

	for (let i = 0; i < number; i++) {
		const doc = model.instance({ data: i });

		promises.push(doc.save());
	}

	return Promise.all(promises);
}

async function deleteOneBenchmark(number) {
	const promises = [],
		model = Model('mongoDriver');

	for (let i = 0; i < number; i++) {
		promises.push(model.deleteOne({}));
	}

	return Promise.all(promises);
}

async function updateOneBenchmark(number) {}

async function findByIdAndUpdate(number) {}

async function findByIdAndDelete(number) {}

module.exports = {
	setupDatabase,
	insertBenchmark,
	deleteOneBenchmark
};
