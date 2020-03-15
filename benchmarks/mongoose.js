'use strict';

const mongoose = require('mongoose');

function setupDatabase(uri) {
	return mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function saveBenchmark(number) {
	const promises = [],
		schema = new mongoose.Schema({}),
		model = mongoose.model('Doc', schema);

	for (let i = 0; i < number; i++) {
		const doc = new model({ data: i });

		promises.push(doc.save());
	}

	return Promise.all(promises);
}

async function saveBenchmarkWithHooks(number) {
	const promises = [],
		schema = new mongoose.Schema({}),
		model = mongoose.model('save', schema);

	let counter = 0;

	schema.pre('save', function() {
		counter++;
	});

	schema.post('save', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		const doc = new model({ data: i });

		promises.push(doc.save());
	}

	return Promise.all(promises);
}

async function deleteOneBenchmark(number) {
	const promises = [],
		schema = new mongoose.Schema({}, { strict: false }),
		model = mongoose.model('delete', schema);

	for (let i = 0; i < number; i++) {
		promises.push(model.deleteOne({}));
	}

	return Promise.all(promises);
}

async function deleteOneBenchmarkWithHooks(number) {
	const promises = [],
		schema = new mongoose.Schema({}, { strict: false }),
		model = mongoose.model('deleteWithHooks', schema);

	let counter = 0;

	schema.pre('remove', function() {
		counter++;
	});

	schema.post('remove', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		promises.push(model.deleteOne({}));
	}

	return Promise.all(promises);
}

async function findOneBenchmark(number) {
	const promises = [],
		schema = new mongoose.Schema({}, { strict: false }),
		model = mongoose.model('findOne', schema);

	for (let i = 0; i < number; i++) {
		promises.push(model.findOne({}));
	}

	return Promise.all(promises);
}

async function updateOneBenchmark(number) {
	const promises = [],
		schema = new mongoose.Schema({}, { strict: false }),
		model = mongoose.model('updateOne', schema);

	for (let i = 0; i < number; i++) {
		promises.push(model.updateOne({}, { data: 'data' }));
	}

	return Promise.all(promises);
}

async function updateOneBenchmarkWithHooks(number) {
	const promises = [],
		schema = new mongoose.Schema({}, { strict: false }),
		model = mongoose.model('updateOneWithHooks', schema);

	let counter = 0;

	schema.pre('update', function() {
		counter++;
	});

	schema.post('update', function() {
		counter++;
	});

	for (let i = 0; i < number; i++) {
		promises.push(model.updateOne({}, { data: 'data' }));
	}

	return Promise.all(promises);
}

module.exports = {
	setupDatabase,
	updateOneBenchmark,
	updateOneBenchmarkWithHooks,
	findOneBenchmark,
	deleteOneBenchmark,
	deleteOneBenchmarkWithHooks,
	saveBenchmark,
	saveBenchmarkWithHooks
};
