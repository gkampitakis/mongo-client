import { ObjectID } from 'mongodb';

const ObjectIdSpy = jest.fn(),
  IsEmptyObjectSpy = jest.fn(),
  StripObjectSpy = jest.fn();

function objectID(id: string) {
  ObjectIdSpy(...arguments);

  return new ObjectID(id);
}

function isEmptyObject(data: any) {
  IsEmptyObjectSpy(...arguments);

  return Object.keys(data).length === 0;
}

function stripObject(data: any) {
  StripObjectSpy(...arguments);
  return data;
}

export { objectID, ObjectIdSpy, isEmptyObject, IsEmptyObjectSpy, stripObject, StripObjectSpy };
