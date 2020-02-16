import { Schema } from '../Schema/Schema';
import { Collection, Db, FilterQuery, FindOneAndUpdateOption, ObjectID, ObjectId } from 'mongodb';

export class Model {
  private collection: Collection;
  private schema: Schema;
  private static database: Db;

  public constructor(collectionName: string, schema: Schema) {
    this.collection = Model.database.collection(collectionName);
    this.schema = schema;
  }

  static setDb(db: Db) {
    if (!Model.database) Model.database = db;
  }

  public findOne(query: any): Promise<any> {
    //TODO: return document wrapped object

    return this.collection.findOne(query);
  }

  public findById(id: string) {
    //TODO: return document wrapped object

    if (!ObjectID.isValid(id)) throw new Error('Invalid id provided');

    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  public findByIdAndUpdate(id: string, update: any, options?: FindOneAndUpdateOption) {
    //TODO: return document wrapped object

    if (!ObjectID.isValid(id)) throw new Error('Invalid id provided');

    return this.collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, options);
  }

  public deleteMany(filter: FilterQuery<any>) {
    return this.collection.deleteMany(filter);
  }

  public instance() {
    //Returns a document
  }
}
//TODO: here we should return documents
