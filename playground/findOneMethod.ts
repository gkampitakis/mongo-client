import pino from 'pino';
import { Model, Schema } from '../';
import { ObjectID } from 'mongodb';

const logger = pino({ prettyPrint: { colorize: true } });

export async function findOneMethod(execute = false) {
	if (!execute) return;
	logger.info('Start findOneMethod functionality');

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

	let result = await userModel.findOne({ _id: '5e4acf03d8e9435b2a2640ae' });

	console.log(result);

	result = await userModel.findOne({ _id: georgeUser.data._id });

	console.log(result);

	const object = await userModel.findOne({ name: 'George' }, true);

	console.log(object);

	logger.info('End findOneMethod functionality');
}
