import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function document(execute = false) {
	if (!execute) return;
	logger.info('Start document functionality');

	logger.info('Finish document functionality');
}
