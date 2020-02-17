import { Logger } from '@gkampitakis/tslog';
import { Schema } from '../Schema/Schema';
import { Db } from 'mongodb';
import { Document, _Document, stripObject } from '../Document/Document';

export abstract class MongoInstance {
  protected readonly _collectionName: string;
  protected readonly logger: Logger;
  protected readonly schema: Schema;
  protected static database: Db;

  public constructor(collectionName: string, schema: Schema) {
    this.logger = new Logger('MongoDriver', true);
    this._collectionName = collectionName;
    this.schema = schema;
  }

  get collectionName(): string {
    return this._collectionName;
  }

  /** @internal */
  static setDb(db: Db) {
    if (!MongoInstance.database) MongoInstance.database = db;
  }

  protected stripObject(document: _Document): Document {
    //TODO: this might be redundant

    return stripObject(document);
  }
}
