import { Schema } from '../Schema/Schema';
import { Collection, FilterQuery, FindOneAndUpdateOption, ObjectID, ObjectId } from 'mongodb';
import { Document } from '../Document/Document';
import { MongoInstance } from '../MongoInstance/MongoInstance';

export class Model extends MongoInstance {
  private readonly collection: Collection;

  public constructor(collectionName: string, schema: Schema) {
    super(collectionName, schema);

    this.collection = Model.database.collection(collectionName);
    this.prepareCollection(collectionName, schema);
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
        const wrappedDoc = Document(this.collectionName, document, this.schema);

        await this.collection.insertOne(wrappedDoc.document);

        resolve(wrappedDoc);
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
