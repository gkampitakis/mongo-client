'use strict';

const { Document } = require('./Document');
const mongodb = require('mongodb');
const { Schema } = require('../Schema/Schema');
const { MONGO_URL } = require('../../setupTests');
const { MongoClient } = require('../MongoDriver/MongoDriver');


describe('Document', () => {
  beforeAll(async () => {
    await MongoClient.connect(MONGO_URL, 'document_db', { useUnifiedTopology: true });
  });

  beforeEach(() => {
  
  });

  describe('Method get schema', () => {
    it('Should return the schema object', () => {
      const schemaDefinition = {
        type: 'object',
        properties: {
          test: { type: 'string' }
        }
      };
      const doc = Document('document_test', {}, new Schema(schemaDefinition));

      expect(doc.schema).toEqual(schemaDefinition);
    });

    it('Should return undefined if no schemaDefinition', () => {
      const doc = Document('document_test', {});

      expect(doc.schema).toBeUndefined();
    });
  });

  describe('Method remove', () => {
    it('Should call delete operation', async () => {
      const doc = Document('document_test', {}, new Schema());

      await doc.save();

      const result = await doc.remove();

      expect(result).toEqual(doc);
    });

    //   it('Should throw error', () => { //BUG: there is no support for disconnecting
    //     MongoInstanceMock.throwError = true;
    //     const doc = Document('document_test', {});

    //     expect(doc.remove()).rejects.toThrowError('MockError');
    //   });
  });

  describe('Method save', () => {
    it('Should save the document', async () => {
      const data = {
        testField: { name: 'test' }
      };
      const doc = Document(
        'document_test',
        data,
        new Schema({
          type: 'object',
          properties: {
            testField: {
              type: 'object',
              properties: {}
            }
          }
        })
      );

      const result = await doc.save();

      expect(result).toEqual(doc);
    });

    it('Should save the document if not schema provided', async () => {
      const data = {
        testField: { name: 'test2' }
      };
      const doc = Document('document_test', data);

      const result = await doc.save();
      expect(result).toEqual(doc);
    });

    //   it('Should throw error', () => {
    //     MongoInstanceMock.throwError = true;

    //     const doc = Document('test', {});

    //     expect(doc.save()).rejects.toThrowError('MockError');
    //   });

      // describe('When schema is present', () => {
      //   it('Should call the pre/post hooks', async () => {
      //     const schema = new Schema(),
      //       callbackHookSpy = jest.fn(),
      //       doc = Document('document_test', {}, schema);

      //     schema.pre('save', function () {
      //       callbackHookSpy();
      //     });

      //     schema.post('save', function () {
      //       callbackHookSpy();
      //     });

      //     await doc.save();

      //     expect(SchemaMock.PreHookSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
      //     expect(SchemaMock.PostHookSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Function));
      //     expect(callbackHookSpy).toHaveBeenCalledTimes(2);
      //     expect(SchemaMock.ExecutePostHooksSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Object), true);
      //     expect(SchemaMock.ExecutePreHooksSpy).toHaveBeenNthCalledWith(1, 'save', expect.any(Object), true);
      //   });
      // });

  });

  describe('Method lean', () => {
    it('Should return the data field', () => {
      const doc = Document('document_test', { testField: { name: 'test' } }, new Schema());

      const result = doc.lean();

      expect(result._id).toBeInstanceOf(mongodb.ObjectID);
      expect(result.testField).toEqual({ name: 'test' });
    });
  });
});
