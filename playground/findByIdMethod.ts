import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function findByIdMethod(execute=false) {
    if (!execute) return;
	logger.info('Start findByIdMethod functionality');
	logger.info('End findByIdMethod functionality');
}
