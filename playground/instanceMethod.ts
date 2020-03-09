import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function instanceMethod(execute = false) {
	if (!execute) return;
	logger.info('Start instanceMethod functionality');
	logger.info('End instanceMethod functionality');
}
