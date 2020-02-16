import { ObjectId } from 'mongodb';

type FieldType = StringConstructor | BooleanConstructor | DateConstructor | ArrayConstructor | typeof ObjectId;

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
  //Interface creation  here
}
