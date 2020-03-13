import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function instanceMethod(execute = false) {
	if (!execute) return;
	logger.info('Start instanceMethod functionality');

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
	});

	const model = Model('instance', schema);

	try {
		model.instance({});
	} catch (error) {
		logger.error(error);
	}

	const document = model.instance({ field: 'test' });

	console.log(document);

	logger.info('End instanceMethod functionality');
}
