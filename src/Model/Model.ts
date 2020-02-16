import { Schema } from '../Schema/Schema';
import { Collection, Db, FilterQuery, FindOneAndUpdateOption, ObjectID, ObjectId } from 'mongodb';
import { Logger } from "@gkampitakis/tslog";
import { Document } from '../Document/Document';

export class Model {
  private collection: Collection;
  private collectionName: string;
  private schema: Schema;
  private static database: Db;
  private logger: Logger;

  public constructor(collectionName: string, schema: Schema) {
    this.logger = new Logger('MongoDriver', true);

    this.collection = Model.database.collection(collectionName);
    this.collectionName = collectionName;
    this.schema = schema;

    this.prepareCollection(collectionName, schema);

  }

  /** @internal */
  static setDb(db: Db) {
    if (!Model.database) Model.database = db;
  }

  public findOne(query: any): Promise<any> {
    //TODO: return document wrapped object
    //Shcema wrap document internal method
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
    //Wrap document with no data
  }

  public create(document: any): Promise<Document> {

    return new Promise(async (resolve, reject) => {

      try {

        const wrapperDoc = this.schema.createDocument(this.collectionName, document);

        await this.collection.insertOne(wrapperDoc.document);

        resolve(wrapperDoc);

      } catch (error) {

        this.logger.error(error.message);

        reject(error);

      }

    });

  }

  private async prepareCollection(collectionName: string, schema: Schema): Promise<any> {

    const collectionExists = await this.collectionExists(collectionName);

    if (collectionExists) return;

    schema.setupCollection(collectionName, Model.database);

  }

  private async collectionExists(collectionName: string) {

    return await Model.database.listCollections({ name: collectionName }).hasNext();


  }

}

//TODO: we need to think the hierarchy and the concers of each one