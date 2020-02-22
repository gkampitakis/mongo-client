import { ObjectID } from 'mongodb';

const ObjectIdSpy = jest.fn(),
  IsEmptyObjectSpy = jest.fn();

function objectID(id: string) {
  ObjectIdSpy(...arguments);

  return new ObjectID(id);
}

function isEmptyObject(data: any) {
  IsEmptyObjectSpy(...arguments);

  return false;
}

export { objectID, ObjectIdSpy, isEmptyObject, IsEmptyObjectSpy };
