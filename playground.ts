import { Schema, MongoDriver, Model } from './index';
import pino from 'pino';
import { MongoMemoryServer } from 'mongodb-memory-server';

const logger = pino({ prettyPrint: { colorize: true } });
const mongodb = new MongoMemoryServer();

function setupDatabase(uri: string, database: string) {
  return MongoDriver.connect(uri, database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

//TODO: expand this and make it more clear in the future here all the uses cases are going to be documented
async function Playground() {
  try {
    const uri = await mongodb.getUri(),
      dbName = await mongodb.getDbName();

    await setupDatabase(uri, dbName);

    logger.info('Database is setup and running');

    const userModel = Model('user');
    const data = await userModel.create({ username: 'George Kampitakis' });

    console.log('Created document', data);

    const result = await schemaWithHooks();


    logger.info('----HOOKS RESULTS----')
    console.log(result, result.lean());

    const schema = new Schema({
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        age: { type: 'number', default: 10 }
      },
      required: ['username', 'age']
    });

    try {
      await schemaValidationsWithError1(schema);
    } catch (error) {
      logger.error(error);
    }

    try {
      await schemaValidationsWithError2(schema);
    } catch (error) {
      logger.error(error);
    }

    const userDoc = await schemaValidations(schema);

    console.log(userDoc);


  } catch (error) {
    logger.error(error);
  }
}

async function schemaWithHooks() {

  const schema = new Schema();

  schema.pre('create', function () {

    this.data.newData = { dynamicObject: 'test' };

  });

  schema.post('create', function () {

    console.log('Created object', this);

  });


  const model = Model('hookModel', schema);

  return model.create({
    myData: {
      test: 'someString'
    }
  });


}

async function schemaValidationsWithError1(schema: Schema) {

  const user = Model('User', schema);

  return user.instance({ username: 5 });

}
async function schemaValidations(schema: Schema) {

  const user = Model('User', schema);

  return user.instance({ username: 'George' });


}


async function schemaValidationsWithError2(schema: Schema) {

  const user = Model('User', schema);

  return user.instance({
    username: 'George',
    age: {}
  });

}

Playground();
