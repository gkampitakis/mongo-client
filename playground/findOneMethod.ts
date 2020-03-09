import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function findOneMethod(execute = false) {
	if (!execute) return;
	logger.info('Start findOneMethod functionality');
	logger.info('End findOneMethod functionality');
}
