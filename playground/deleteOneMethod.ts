import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function deleteOneMethod(execute = false) {
	if (!execute) return;
	logger.info('Start deleteOneMethod functionality');

	const model = Model('deleteMethod');

	const doc = await model.create({ username: 'george' }, true);

	logger.info(doc, '[Created Doc]');

	const { result } = await model.deleteOne({ username: 'george' });
	//TODO: add hooks here
	logger.info(result, '[Delete Results]');

	logger.info('End deleteOneMethod functionality');
}
