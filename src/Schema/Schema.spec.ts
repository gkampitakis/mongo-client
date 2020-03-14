import { Schema } from './';

jest.mock('kareem');
jest.mock('../Utils/Utils');

describe('Schema', () => {
	let schema: Schema;
	const KareemMock = jest.requireMock('kareem').Kareem,
		{ StripObjectSpy } = jest.requireMock('../Utils/Utils');

	beforeEach(() => {
		KareemMock.PostSpy.mockClear();
		KareemMock.ExecutePostSpy.mockClear();
		KareemMock.PreSpy.mockClear();
		KareemMock.ExecutePreSpy.mockClear();
		StripObjectSpy.mockClear();

		KareemMock._pres = new Map();
		KareemMock._posts = new Map();
	});

	describe('Method validate', () => {
		it('Should throw error if required is missing', () => {
			schema = new Schema({
				type: 'object',
				properties: {
					username: {
						type: 'string'
					}
				},
				required: ['username']
			});

			expect(() => schema.validate({})).toThrowError("[required]  - should have required property 'username'");
		});

		it("Should throw error if default value doesn't have the same type", () => {
			schema = new Schema({
				type: 'object',
				properties: {
					username: {
						type: 'string',
						default: ['array'] as any
					}
				},
				required: ['username']
			});

			expect(() =>
				schema.validate({
					test: 'test'
				})
			).toThrowError('[type] .username - should be string');
		});

		it('Should throw error if data are different type of schema', () => {
			schema = new Schema({
				type: 'object',
				properties: {
					username: {
						type: 'string'
					}
				},
				required: ['username']
			});

			expect(() => schema.validate({ username: { test: 'test' } })).toThrowError(
				'[type] .username - should be string'
			);
		});

		it('Should not throw error if valid data', () => {
			schema = new Schema({
				type: 'object',
				properties: {
					username: {
						type: 'string'
					}
				},
				required: ['username']
			});

			expect(() => schema.validate({ username: 'test' })).not.toThrowError();
		});

		it('Should not throw error if not schema provided', () => {
			const schema = new Schema();

			expect(() => schema.validate({ test: 'test' })).not.toThrowError();
		});

		it('Should return the data', () => {
			const schema = new Schema({
				type: 'object',
				properties: {
					test: { type: 'string' }
				}
			});

			const data = schema.validate({ test: 'data' });

			expect(data).toEqual({ test: 'data' });
		});

		it('Should return the data sanitized', () => {
			const schema = new Schema({
				type: 'object',
				properties: {
					test: { type: 'string' }
				},
				additionalProperties: false
			});

			const data = schema.validate({ test: 'data', additional: false });

			expect(data).toEqual({ test: 'data' });
		});

		it('Should use the default values', () => {
			const schema = new Schema({
				type: 'object',
				properties: {
					string: { type: 'string', default: 'test' },
					number: { type: 'number', default: 10 },
					boolean: { type: 'boolean', default: false }
				}
			});

			const data = schema.validate({});

			expect(data).toEqual({ string: 'test', number: 10, boolean: false });
		});
	});

	describe('Method pre/post', () => {
		it('Should call the hooks pre/post function', () => {
			const schema = new Schema();

			schema.post('save', () => 'test');
			schema.pre('save', () => 'test');

			expect(KareemMock.PostSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
			expect(KareemMock.PreSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
		});
	});

	describe('Methods has hooks', () => {
		it('Should return true if has registered hooks', () => {
			KareemMock._pres.set('test', () => 'test');
			KareemMock._posts.set('test', () => 'test');

			const schema = new Schema();

			expect(schema.hasPostHooks).toBe(true);
			expect(schema.hasPreHooks).toBe(true);
		});
		it('Should return false if has not registered hooks', () => {
			const schema = new Schema();

			expect(schema.hasPostHooks).toBe(false);
			expect(schema.hasPreHooks).toBe(false);
		});
	});

	describe('Method execute pre/post hooks', () => {
		describe('When the execute pre/post hooks function called', () => {
			it('Should call the stripObject if lean is false', async () => {
				const schema = new Schema();

				KareemMock._pres.set('test', () => 'test');
				KareemMock._posts.set('test', () => 'test');

				await schema.executePostHooks('save', () => 'test', false);
				await schema.executePreHooks('save', () => 'test', false);

				expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(1);
				expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(1);
				expect(StripObjectSpy).toHaveBeenCalledTimes(2);
			});

			it('Should not call the stripObject if lean is true', async () => {
				const schema = new Schema();

				KareemMock._pres.set('test', () => 'test');
				KareemMock._posts.set('test', () => 'test');

				await schema.executePostHooks('save', () => 'test', true);
				await schema.executePreHooks('save', () => 'test', true);

				expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(1);
				expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(1);
				expect(StripObjectSpy).toHaveBeenCalledTimes(0);
			});
		});

		it('Should not call the execute pre/post hooks function if no hooks registered', async () => {
			KareemMock._pres = new Map();
			KareemMock._posts = new Map();

			const schema = new Schema();

			await schema.executePostHooks('save', () => 'test', false);
			await schema.executePreHooks('save', () => 'test', false);

			expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(0);
			expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(0);
		});
	});
});
