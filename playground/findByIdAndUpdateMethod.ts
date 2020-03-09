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
		model = Model('updateById', schema);

	logger.info('End findByIdAndUpdateMethod functionality');
}
