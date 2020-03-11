import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function findByIdMethod(execute = false) {
	if (!execute) return;
	logger.info('Start findByIdMethod functionality');

	const schema = new Schema({
		type: 'object',
		properties: {
			name: {
				type: 'string'
			},
			email: {
				type: 'string'
			},
			age: {
				type: 'integer'
			}
		},
		required: ['name', 'email']
	}),
		userModel = Model('user', schema);

	const georgeUser = await userModel.create({ name: 'George', email: 'test' });

	try {
		await userModel.findById('123');
	} catch (error) {
		logger.error(error);
	}

	let result = await userModel.findById('5e4acf03d8e9435b2a2640ae');

	console.log(result);

	result = await userModel.findById(georgeUser.data._id);

	console.log(result);
	
	logger.info('End findByIdMethod functionality');
}
