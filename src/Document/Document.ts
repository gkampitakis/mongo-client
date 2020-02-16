import { Db, ObjectID } from 'mongodb';

export class Document {

  public document: any;
  private _collectionName: string;
  private static database: Db;

  public constructor(collection: string, doc?: any) {
    this._collectionName = collection;
    this.document = doc;
  }

  get collectionName(): string {

    return this._collectionName;

  }

  /** @internal */
  static setDb(db: Db) {
    if (!Document.database) Document.database = db;
  }

  public remove(): Promise<any> {

    const collection = Document.database.collection(this.collectionName);

    return collection.deleteOne({ _id: new ObjectID(this.document._id) });

  }

  public save() {

    console.log('saving doc');


  }

  public lean() {
    console.log('leaning doc');

  }

}