export class Schema {
	public static SetupCollectionSpy = jest.fn();
	public static SanitizeDataSpy = jest.fn();
	public static IsValidSpy = jest.fn();

	public setupCollection(collectionName: any, db: any) {
		Schema.SetupCollectionSpy(...arguments);

		return;
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
