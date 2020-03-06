import { ObjectID } from 'mongodb';

const ObjectIdSpy = jest.fn(),
	IsEmptyObjectSpy = jest.fn(),
	StripObjectSpy = jest.fn(),
	extractUniqueValuesSpy = jest.fn();

function objectID(id: string) {
	ObjectIdSpy(...arguments);

	return new ObjectID(id);
}

function isEmptyObject(data: any) {
	IsEmptyObjectSpy(...arguments);
	if (!data) return false;
	return Object.keys(data).length === 0;
}

function stripObject(data: any) {
	StripObjectSpy(...arguments);
	return data;
}

function extractUniqueValues(data: any) {
	extractUniqueValuesSpy(...arguments);
	return ['mockIndex'];
}

export {
	objectID,
	ObjectIdSpy,
	isEmptyObject,
	IsEmptyObjectSpy,
	stripObject,
	StripObjectSpy,
	extractUniqueValues,
	extractUniqueValuesSpy
};
