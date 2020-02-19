import { Schema } from '../Schema/Schema';
import { FilterQuery, FindOneAndUpdateOption, ObjectID, ObjectId } from 'mongodb';
import { Document } from '../Document/Document';
import { MongoInstance } from '../MongoInstance/MongoInstance';

export class Model extends MongoInstance {

  public constructor(collectionName: string, schema: Schema) {
    super(collectionName, schema);
    this.prepareCollection(collectionName, schema);
  }

  public findOne(query: any): Promise<any> {
    //TODO: return document wrapped object 
    //Schema wrap document internal method

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

  public instance<Generic>(data: Generic): Document<Generic> {

    return Document<Generic>(this.collectionName, data, this.schema);

  }

  public create<Generic>(data: Generic): Promise<Document<Generic>> {
    return new Promise(async (resolve, reject) => {
      try {
        const wrappedDoc = Document(this.collectionName, data, this.schema);

        await this.collection.insertOne(wrappedDoc.data);

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


/**
 *  ------------ BACKLOG ------------
 *
 *  Implement all CRUD functions
 *  Implement all functions used at personal projects
 *  Return wrapped document objects
 *  Return Correct types
 *  //TODO:: create a map like structure to save all the models no need to be re-instantiated
 *  //TODO: here the byId functions should take both string or ObjectID
 *  //TODO: find the way that you write comments and they are shown above in the editor
 *  //TODO: create unique index for searching - add this support to schema
 *  //TODO: benchmarks
 *  //TODO: schema validation wherever needed
 *  //TODO: add support for ignoring schema validation and make sure when this happens it is actually with less boiler plate code
 *  Jest tests
 *
 */