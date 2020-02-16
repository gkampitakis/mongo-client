import { Db, ObjectID } from 'mongodb';
import { Schema } from "../Schema/Schema";

export class Document {

  public document: any;
  private _collectionName: string;
  private schema: Schema;
  private static database: Db;

  public constructor(collection: string, doc: any, schema: Schema) {
    this._collectionName = collection;
    this.document = doc;
    this.schema = schema;

    this.schema.validate(doc);
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