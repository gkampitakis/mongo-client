export class Schema {
  public static SetupCollectionSpy = jest.fn();

  public setupCollection(collectionName: any, db: any) {
    Schema.SetupCollectionSpy(...arguments);

    return;
  }
}
