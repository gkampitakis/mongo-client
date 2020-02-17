import { Db, ObjectId } from 'mongodb';

type FieldType = "string" | "number" | "object" | typeof ObjectId;

interface SchemaModel {
  [key: string]: {
    type: FieldType | { type: FieldType; ref: Schema }[];
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
  public validate(document: any) {//TODO: this needs more testing

    const schema = this._schema,
      sanitizedDoc: any = {};

    for (const field in schema) {

      if (schema[field].required) {

        if (!document[field] && !schema[field].default) throw new Error(`${field} field is required`);

        if (!document[field]) {

          document[field] = schema[field].default;

        }

      }

      if (document[field]) {

        if (schema[field].type !== typeof document[field]) {

          throw new Error(`${field} must be type of ${schema[field].type}`);

        }

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
