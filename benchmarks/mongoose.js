const mongoose = require('mongoose');

function setupDatabase(uri) {
	return mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function insertBenchmark(number) {
	const promises = [],
		Document = mongoose.model('Doc', new mongoose.Schema({}, { strict: false }));

	for (let i = 0; i < number; i++) {
		const doc = new Document({ data: i });

		promises.push(doc.save());
	}

	return Promise.all(promises);
}

module.exports = {
	setupDatabase,
	insertBenchmark
};
