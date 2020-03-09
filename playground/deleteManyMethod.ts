import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function deleteManyMethod(execute = false) {
	if (!execute) return;

	logger.info('Start deleteManyMethod functionality');

	const model = Model('deleteManyModel');

	const result = await model.deleteMany({});

	console.log(result);

	logger.info('End deleteManyMethod functionality');
}
