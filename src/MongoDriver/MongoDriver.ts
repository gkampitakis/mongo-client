import mongodb, { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { Model } from '../Model/Model';
import { Document } from '../Document/Document';
import { Logger } from '@gkampitakis/tslog';

class MongoDriver {
  private db: Db | undefined;
  private static instance: MongoDriver;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('MongoDriver', true);
  }

  public static getInstance(): MongoDriver {
    if (!MongoDriver.instance) {
      MongoDriver.instance = new MongoDriver();
    }

    return MongoDriver.instance;
  }

  public connect(uri: string, database: string, options?: MongoClientOptions) {
    return mongodb.connect(uri, options).then(async (client: MongoClient) => {
      this.logger.info(`Connected to ${database}`);
      this.db = client.db(database);

      Model.setDb(this.db);
      Document.setDb(this.db);

      return;
    });
  }

  //FIXME: jest tests
  //FIXME: README
  //FIXME: jenkins file
  //TODO: populate ??
}

export const _MongoDriver = MongoDriver.getInstance();
