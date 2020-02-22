import { isEmptyObject, objectID } from '../Utils/Utils';
import {
  DeleteWriteOpResultObject,
  FilterQuery,
  FindAndModifyWriteOpResultObject,
  FindOneAndUpdateOption
} from 'mongodb';
import { Schema } from '../Schema/Schema';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { Document } from '../Document/Document';

/** @internal */
class InternalModel extends MongoInstance {
  public static cache: Map<string, InternalModel> = new Map();

  public constructor(collectionName: string, schema: Schema) {
    super(collectionName, schema);
    this.prepareCollection(collectionName, schema);
  }

  public findOne(query: any): Promise<Document | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.collection.findOne(query);

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

        if (!result.value) return resolve(null);

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

    schema.setupCollection(collectionName, InternalModel.database);
  }

  private async collectionExists(collectionName: string) {
    return await InternalModel.database.listCollections({ name: collectionName }).hasNext();
  }
}

export function Model(collectionName: string, schema: Schema): Model {
  if (InternalModel.cache.has(collectionName)) {
    return InternalModel.cache.get(collectionName) as Model;
  }

  const newModel = new InternalModel(collectionName, schema);

  InternalModel.cache.set(collectionName, newModel);

  return newModel as Model;
}

export type Model = {
  instance<Generic>(data: Generic): Document<Generic>;
  create<Generic>(data: Generic): Promise<Document<Generic>>;
  deleteMany(filter: FilterQuery<any>): Promise<DeleteWriteOpResultObject>;
  findByIdAndUpdate(
    id: string,
    update: any,
    options?: FindOneAndUpdateOption
  ): Promise<FindAndModifyWriteOpResultObject<any>>;
  findById(id: string): Promise<Document | null>;
  findOne(query: any): Promise<Document | null>;
};

/**
 *  ------------ BACKLOG ------------
 *
 *  Implement all functions used at personal projects
 *  Start writing the tests and then continue with everything else
 *
 *  Return Correct types
 *  //TODO: find the way that you write comments and they are shown above in the editor
 *  //TODO: benchmarks
 *  //TODO: schema validation wherever needed
 *  //TODO: add support for ignoring schema validation and make sure when this happens it is actually with less boiler plate code
 *  //FIXME: README
 *  //FIXME: jenkins file
 *  //TODO: populate ??
 *
 * Jest tests
 *
 */
