import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function deleteOneMethod(execute = false) {
	if (!execute) return;
	logger.info('Start deleteOneMethod functionality');

	const schema = new Schema(),
		model = Model('deleteMethod', schema);

	schema.pre('delete', function () {
		console.log(this, '[Pre Delete Hook]');
	});

	schema.post('delete', function () {
		console.log(this, '[Post Delete Hook]');
	});

	const doc = await model.create({ username: 'george' }, { lean: true });

	logger.info(doc, '[Created Doc]');

	const { result } = await model.deleteOne({ username: 'george' }, { lean: true });

	logger.info(result, '[Delete Results]');

	logger.info('End deleteOneMethod functionality');
}
