import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function findByIdAndUpdateMethod(execute = false) {
	if (!execute) return;
	logger.info('Start findByIdAndUpdateMethod functionality');

	const schema = new Schema({
		type: 'object',
		properties: {
			field: {
				type: 'string'
			},
			field2: {
				type: 'string'
			},
			field3: {
				type: 'string'
			},
			field4: {
				type: 'string'
			}
		},
		required: ['field']
	}),
		model = Model('updateByIdModel', schema);

	schema.pre('update', function () {

		console.log(this, '[Pre Update Hook]');
		if (this.data) this.data.field = 'hookValue';
		else this.field2 = 'cant override';

	});


	schema.post('update', function () {

		console.log(this, '[Post Update Hook]');

	});

	const doc = await model.create({ field: 'field' });


	try {

		await model.findByIdAndUpdate(doc.data._id, { field2: { test: 'test' } });

	} catch (error) {

		logger.error(error);

	}

	const result = await model.findByIdAndUpdate(doc.data._id, { field2: 'field2' });

	console.log(result);

	await model.findByIdAndUpdate(doc.data._id, { field2: 'newValue' }, true);


	logger.info('End findByIdAndUpdateMethod functionality');
}
