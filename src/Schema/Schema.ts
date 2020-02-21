import { Db, ObjectId } from 'mongodb';

//TODO: this will be deprecated and will break into utils and model functions

type FieldType = 'string' | 'number' | 'object' | typeof ObjectId;

interface SchemaModel {
  [key: string]: {
    type: FieldType | { type: FieldType; ref: Schema }[]; //TODO: this will need further investigation
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
  //TODO:
  //HOOKS
  //Paths validation

  /** @internal */
  public isValid(document: any, ignoreRequired = false) {
    //TODO: this needs more testing

    const schema = this._schema;

    for (const field in schema) {
      if (schema[field].required && !ignoreRequired) {
        if (!document[field] && !schema[field].default) throw new Error(`${field} field is required`);

        if (!document[field]) {
          document[field] = schema[field].default;
        }
      }

      if (document[field] && schema[field].type !== typeof document[field]) {
        throw new Error(`[Default value] ${field} must be type of ${schema[field].type}`);
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
    const schema = this._schema;

    for (const field in schema) {
      if (schema[field].unique) {
        const collection = await db.createCollection(collectionName);

        const index: any = {};
        index[field] = 1;

        collection.createIndex(index, { unique: true });
      }
    }
  }
}

/**
 *  ------------ BACKLOG ------------
 *  //TODO: empty object on schema throw error
 */
