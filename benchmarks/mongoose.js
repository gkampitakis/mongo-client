'use strict';

const mongoose = require('mongoose'),
	model = mongoose.model('Doc', new mongoose.Schema({}, { strict: false }));

function setupDatabase(uri) {
	return mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function insertBenchmark(number) {
	const promises = [];

	for (let i = 0; i < number; i++) {
		const doc = new model({ data: i });

		promises.push(doc.save());
	}

	return Promise.all(promises);
}

async function deleteOneBenchmark(number) {
	const promises = [];

	for (let i = 0; i < number; i++) {
		promises.push(model.deleteOne({}));
	}

	return Promise.all(promises);
}

module.exports = {
	setupDatabase,
	insertBenchmark,
	deleteOneBenchmark
};
