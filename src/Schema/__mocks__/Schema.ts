export class Schema {
	public static ValidateSpy = jest.fn();
	public static PreHookSpy = jest.fn();
	public static PostHookSpy = jest.fn();
	public static ExecutePreHooksSpy = jest.fn();
	public static ExecutePostHooksSpy = jest.fn();

	public static schemaDefinition = {};

	public static HasHooks = true;

	public pre(hook: any, callback: any) {
		Schema.PreHookSpy(...arguments);

		callback();
	}

	get hasPreHooks(): boolean {
		return Schema.HasHooks;
	}

	get hasPostHooks(): boolean {
		return Schema.HasHooks;
	}

	get schemaDefinition() {
		return Schema.schemaDefinition;
	}

	public post(hook: any, callback: any) {
		Schema.PostHookSpy(...arguments);
		callback();
	}

	executePreHooks(hookType: any, context: any, lean: any) {
		const deepRef = {};

		Object.assign(deepRef, context);

		Schema.ExecutePreHooksSpy(hookType, deepRef, lean);
	}

	executePostHooks(hookType: any, context: any, lean: any) {
		Schema.ExecutePostHooksSpy(hookType, context, lean);
	}

	public validate(data: any) {
		Schema.ValidateSpy(...arguments);

		return data;
	}
}
