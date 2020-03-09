import pino from 'pino';
import { Model, Schema } from '../';

const logger = pino({ prettyPrint: { colorize: true } });

export async function createMethod(execute = false) {
	if (!execute) return;
	logger.info('Start createMethod functionality');

	const schema = new Schema({
		type: 'object',
		properties: {
			field: {
				type: 'string'
			},
			field2: {
				type: 'string'
			},
			field3: {
				type: 'string'
			},
			field4: {
				type: 'string'
			}
		},
		required: ['field']
	});

	/**
	 * Here in the hooks we need anonymous function and not arrow
	 * function in order to have access to this context of the document
	 */
	schema.pre('create', function() {
		console.log(this, '[Presave Hook Data]');

		if (this.data) this.data.field = 'change';
		else this.field = 'change';
		return;
	});

	schema.pre('create', function() {
		console.log(this, '[Post Hook Data]');
	});

	const model = Model('createModel', schema);

	await model.create({ field: '1' }, true), model.create({ field: '1' });

	const newModel = Model('testingModel'); //TODO: this functionality will be removed
	/**
	 * Here we take the previous model which contains schema validation
	 * so the code below will throw error
	 **/

	try {
		await newModel.create({ field2: 'testField' });
	} catch (error) {
		logger.error(error);
	}

	let documentWrapped = await newModel.create({ field: '1' }),
		document = await newModel.create({ field: '1' }, true);

	console.log(documentWrapped, '[Wrapped Doc]');
	console.log(document, '[Lean Doc]');

	logger.info('End createMethod functionality');
}
