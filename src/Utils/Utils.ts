import { Document } from '../Document/Document';
import { ObjectID } from 'mongodb';

/** @internal */
export function isEmptyObject(object: {}): boolean {
  return Object.keys(object).length === 0;
}

/** @internal */
export function objectID(id: string): ObjectID {
  if (!ObjectID.isValid(id)) throw new Error('Invalid id provided');

  return new ObjectID(id);
}

/** @internal */
export function stripObject(document: Document): Document {
  return {
    data: document.data,
    lean: document.lean,
    save: document.save,
    remove: document.remove,
    collectionName: document.collectionName
  };
}


// Write tests for here as well