import mongodb, { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { MongoInstance } from '../MongoInstance/MongoInstance';

// eslint-disable-next-line @typescript-eslint/class-name-casing
class _MongoDriver {
	private db: Db | undefined;
	public client: MongoClient | undefined;
	private static instance: _MongoDriver;

	public static getInstance(): _MongoDriver {
		if (!_MongoDriver.instance) {
			_MongoDriver.instance = new _MongoDriver();
		}

		return _MongoDriver.instance;
	}

	public connect(uri: string, database: string, options?: MongoClientOptions) {
		return mongodb.connect(uri, options).then(async (client: MongoClient) => {
			this.db = client.db(database);
			this.client = client;

			MongoInstance.setDb(this.db);

			return;
		});
	}
}

export const MongoDriver = _MongoDriver.getInstance();
