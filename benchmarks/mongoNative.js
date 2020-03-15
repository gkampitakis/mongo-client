'use strict';

const mongoDb = require('mongodb');

let dbClient = null;

function setupDatabase(uri) {
	return mongoDb
		.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(client => {
			dbClient = client;
		});
}

async function insertBenchmark(number) {
	const promises = [];

	for (let i = 0; i < number; i++) {
		promises.push(
			dbClient
				.db('benchmarks')
				.collection('mongoNative')
				.insertOne({ data: i })
		);
	}

	return Promise.all(promises);
}

async function deleteOneBenchmark(number) {
	const promises = [];

	for (let i = 0; i < number; i++) {
		promises.push(
			dbClient
				.db('benchmarks')
				.collection('mongoNative')
				.deleteOne({})
		);
	}

	return Promise.all(promises);
}

async function updateOneBenchmark(number) {
	const promises = [];

	for (let i = 0; i < number; i++) {
		promises.push(
			dbClient
				.db('benchmarks')
				.collection('mongoNative')
				.update({}, { data: 'data' })
		);
	}

	return Promise.all(promises);
}

async function findOneBenchmark(number) {
	const promises = [];

	for (let i = 0; i < number; i++) {
		promises.push(
			dbClient
				.db('benchmarks')
				.collection('mongoNative')
				.findOne({})
		);
	}

	return Promise.all(promises);
}

module.exports = {
	setupDatabase,
	insertBenchmark,
	findOneBenchmark,
	updateOneBenchmark,
	deleteOneBenchmark
};
