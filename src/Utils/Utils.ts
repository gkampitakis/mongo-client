import { ObjectID } from "mongodb";

export function isEmptyObject(object: {}): boolean {

  return Object.keys(object).length === 0;

}

export function objectID(id: string): ObjectID {

  if (!ObjectID.isValid(id)) throw new Error('Invalid id provided');

  return new ObjectID(id);

}