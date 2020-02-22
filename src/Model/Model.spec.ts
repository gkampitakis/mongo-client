import { Model } from './Model';
import { Schema } from "../Schema/Schema";
import { MongoDriver } from '../MongoDriver/MongoDriver';

jest.mock('../Document/Document');

describe('initial testing suite', () => {

  const { DocumentSpy } = jest.requireMock('../Document/Document');

  beforeAll(async (done) => {

    await MongoDriver.connect('mongodb://localhost:27017', 'mongoDriver', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    done();

  });

  afterAll(async (done) => {

    await MongoDriver.disconnect();

    done();

  });

  afterEach(() => {

    DocumentSpy.mockClear();

  });

  it('expect', async () => {

    const test = Model('test', new Schema({ username: { type: 'string' } }));
    await test.instance({ username: 'George' });

    expect(DocumentSpy).toHaveBeenCalledTimes(1);

  });

});

/**
 *
 * //TODO: 1st create mock up for schema
 *  > test the setup collection is called on start is called with arguments
 *  > and not called when the collection already exists
 *
 *  > findOne
 *  > if the doc doesn't exist we don't call the document
 *  > else we call the document  function and resolve
 *
 *  > findById doesn't need testing
 *
 *  > findByIdAndUpdate
 *  > create mock objectID is called
 *  > sanitizeData is called
 *  > is empty object mock up
 *  > is valid is called
 *  > same as findOne
 *
 *
 *  > instance check if document is called with arguments
 *
 *  > Test the caching mechanism
 */