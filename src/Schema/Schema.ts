import { Db, ObjectId } from 'mongodb';

type FieldType = 'string' | 'number' | 'object' | typeof ObjectId;

interface SchemaModel {
  [key: string]: {
    type: FieldType | { type: FieldType; ref: Schema }[]; //TODO: this will need further investigation //BUG: this should have a model reference
    required?: boolean;
    default?: any;
    unique?: boolean;
  };
}

export class Schema {
  private _schema: SchemaModel;

  public constructor(schema: SchemaModel) {
    this._schema = schema;
  }

  /** @internal */
  public isValid(document: any, ignoreRequired = false) {
    const schema = this._schema;

    for (const field in schema) {
      if (schema[field].required && !ignoreRequired) {
        if (!document[field] && !schema[field].default) throw new Error(`${field} field is required`);

        if (!document[field]) {
          document[field] = schema[field].default;
        }
      }

      if (document[field] && schema[field].type !== typeof document[field]) {
        throw new Error(`${field} must be type of ${schema[field].type}`);
      }
    }
  }

  /** @internal */
  public sanitizeData(document: any) {
    const schema = this._schema,
      sanitizedDoc: any = {};

    for (const field in schema) {
      if (document[field]) {
        sanitizedDoc[field] = document[field];
      }
    }

    return sanitizedDoc;
  }

  /** @internal */
  public async setupCollection(collectionName: string, db: Db) {
    const collection = await db.createCollection(collectionName);

    const schema = this._schema;

    for (const field in schema) {
      if (schema[field].unique) {
        const index: any = {};
        index[field] = 1;

        collection.createIndex(index, { unique: true });
      }
    }
  }
}

/**
 *  ------------ BACKLOG ------------
 *  //TODO: Paths
 *  //TODO: Hooks
 *  //Populate and schema reference to another Model
 */
