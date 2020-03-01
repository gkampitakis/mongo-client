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
				.insert({ data: i })
		);
	}

	return Promise.all(promises);
}

module.exports = {
	setupDatabase,
	insertBenchmark
};
