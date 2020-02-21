import { isEmptyObject, objectID } from "../Utils/Utils";
import { FilterQuery, FindOneAndUpdateOption } from 'mongodb';
import { Schema } from '../Schema/Schema';
import { Document } from '../Document/Document';
import { MongoInstance } from '../MongoInstance/MongoInstance';

export class Model extends MongoInstance {

  public constructor(collectionName: string, schema: Schema) {
    super(collectionName, schema);
    this.prepareCollection(collectionName, schema);
  }

  public findOne(query: any): Promise<any> {

    return new Promise(async (resolve, reject) => {
      try {

        const result = this.collection.findOne(query);


        if (!result) return resolve(null);

        const wrappedDoc = Document(this.collectionName, result, this.schema);

        resolve(wrappedDoc);

      } catch (error) {

        reject(error);

      }
    });
  }

  public findById(id: string): Promise<Document | null> {

    const _id = objectID(id);

    return this.findOne({ _id });

  }

  public findByIdAndUpdate(id: string, update: any, options?: FindOneAndUpdateOption) {

    const _id = objectID(id);

    return new Promise(async (resolve, reject) => {
      try {

        const validData = this.schema.sanitizeData(update);

        if (isEmptyObject(validData)) return resolve(null);

        this.schema.isValid(update, true);

        const result = await this.collection.findOneAndUpdate({ _id }, { $set: validData }, options);

        if (!result) return resolve(null);

        const wrappedDoc = Document(this.collectionName, result.value, this.schema);

        resolve(wrappedDoc);

      } catch (error) {

        reject(error);

      }
    });

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
 *  Implement all functions used at personal projects
 *  Start writing the tests and then continue with everything else
 *  Create the Util package and the autobind method
 *
 *  Return Correct types
 *  //TODO:: create a map like structure to save all the models no need to be re-instantiated
 *  //TODO: find the way that you write comments and they are shown above in the editor
 *  //TODO: create unique index for searching - add this support to schema
 *  //TODO: benchmarks
 *  //TODO: schema validation wherever needed
 *  //TODO: add support for ignoring schema validation and make sure when this happens it is actually with less boiler plate code
 *  Jest tests
 *
 */