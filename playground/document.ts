import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function document(execute = false) {
	if (!execute) return;
	logger.info('Start document functionality');

	const schema = new Schema({
			type: 'object',
			properties: {
				name: {
					type: 'string'
				},
				path: {
					type: 'string'
				},
				owners: {
					type: 'array',
					contains: {
						type: 'string'
					}
				}
			},
			required: ['name', 'path', 'owners'],
			additionalProperties: true
		}),
		document = Model('document', schema).instance({
			name: 'test.txt',
			path: 'c://desktop/folder',
			owners: ['george', 'user']
		});

	schema.pre('save', function() {
		this.data._v = 1;
		console.log(this, '[Pre save hook]');
	});

	schema.post('save', function() {
		console.log(this, '[Post save hook]');
	});

	schema.pre('delete', function() {
		console.log(this, '[Pre delete hook]');
	});
	schema.post('delete', function() {
		console.log(this, '[Post delete hook]');
	});

	await document.save();

	await document.remove();

	logger.info('Finish document functionality');
}
