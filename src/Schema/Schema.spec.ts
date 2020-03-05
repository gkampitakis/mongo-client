import { Schema } from './';

jest.mock('kareem');

describe('Schema', () => {
	let schema: Schema;
	const KareemMock = jest.requireMock('kareem').Kareem;

	beforeEach(() => {
		KareemMock.PostSpy.mockClear();
		KareemMock.ExecutePostSpy.mockClear();
		KareemMock.PreSpy.mockClear();
		KareemMock.ExecutePreSpy.mockClear();
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

			expect(() => schema.validate({})).toThrowError('[required]  - should have required property \'username\'');
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

	describe('Method execute pre/post hooks', () => {
		it('Should call the execute pre/post hooks function if hooks registered', async () => {
			const schema = new Schema();

			KareemMock._pres.set('test', () => 'test');
			KareemMock._posts.set('test', () => 'test');

			await schema.executePostHooks('save', () => 'test');
			await schema.executePreHooks('save', () => 'test');

			expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(1);
			expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(1);
		});

		it('Should not call the execute pre/post hooks function if no hooks registered', async () => {
			KareemMock._pres = new Map();
			KareemMock._posts = new Map();

			const schema = new Schema();

			await schema.executePostHooks('save', () => 'test');
			await schema.executePreHooks('save', () => 'test');

			expect(KareemMock.ExecutePostSpy).toHaveBeenCalledTimes(0);
			expect(KareemMock.ExecutePreSpy).toHaveBeenCalledTimes(0);
		});
	});
});
