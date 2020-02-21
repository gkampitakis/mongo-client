import mongodb, { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { MongoInstance } from '../MongoInstance/MongoInstance';
import { Logger } from '@gkampitakis/tslog';

// eslint-disable-next-line @typescript-eslint/class-name-casing
class _MongoDriver {
  private db: Db | undefined;
  private static instance: _MongoDriver;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('MongoDriver', true);
  }

  public static getInstance(): _MongoDriver {
    if (!_MongoDriver.instance) {
      _MongoDriver.instance = new _MongoDriver();
    }

    return _MongoDriver.instance;
  }

  public connect(uri: string, database: string, options?: MongoClientOptions) {
    return mongodb.connect(uri, options).then(async (client: MongoClient) => {
      this.logger.info(`Connected to ${database}`);
      this.db = client.db(database);

      MongoInstance.setDb(this.db);

      return;
    });
  }
}

export const MongoDriver = _MongoDriver.getInstance();
