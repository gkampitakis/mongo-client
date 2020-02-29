export class Schema {
	public static SetupCollectionSpy = jest.fn();
	public static SanitizeDataSpy = jest.fn();
	public static IsValidSpy = jest.fn();
	public static PreHookSpy = jest.fn();
	public static PostHookSpy = jest.fn();
	public static ExecutePreHooksSpy = jest.fn();
	public static ExecutePostHooksSpy = jest.fn();

	public static schemaObject = {};

	public setupCollection(collectionName: any, db: any) {
		Schema.SetupCollectionSpy(...arguments);

		return;
	}

	public pre(hook: any, callback: any) {
		Schema.PreHookSpy(...arguments);

		callback();
	}

	get schemaObject() {
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

	public sanitizeData(data: any) {
		Schema.SanitizeDataSpy(...arguments);

		return data;
	}

	public isValid(data: any, flag: boolean) {
		Schema.IsValidSpy(...arguments);

		return true;
	}
}
