export class Schema {
	public static ValidateSpy = jest.fn();
	public static PreHookSpy = jest.fn();
	public static PostHookSpy = jest.fn();
	public static ExecutePreHooksSpy = jest.fn();
	public static ExecutePostHooksSpy = jest.fn();

	public static schemaObject = {};

	public pre(hook: any, callback: any) {
		Schema.PreHookSpy(...arguments);

		callback();
	}

	get schemaDefinition() {
		return Schema.schemaObject;
	}

	public post(hook: any, callback: any) {
		Schema.PostHookSpy(...arguments);
		callback();
	}

	executePreHooks(hookType: any, callback: any) {
		Schema.ExecutePreHooksSpy(...arguments);
	}

	executePostHooks(hookType: any, callback: any) {
		Schema.ExecutePostHooksSpy(...arguments);
	}

	public validate(data: any) {
		Schema.ValidateSpy(...arguments);

		return data;
	}
}
