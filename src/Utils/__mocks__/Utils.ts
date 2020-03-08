import { ObjectID } from 'mongodb';
import equal from 'fast-deep-equal';

const ObjectIdSpy = jest.fn(),
	IsEmptyObjectSpy = jest.fn(),
	StripObjectSpy = jest.fn(),
	ExtractUniqueValuesSpy = jest.fn(),
	ObjectEqualitySpy = jest.fn();

function objectID(id?: string) {
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
	ExtractUniqueValuesSpy(...arguments);
	return ['mockIndex'];
}

function objectEquality(source: any, target: any): boolean {
	ObjectEqualitySpy(...arguments);
    return equal(target, source);
}

export {
	objectID,
	ObjectIdSpy,
	isEmptyObject,
	IsEmptyObjectSpy,
	stripObject,
	StripObjectSpy,
	extractUniqueValues,
	ExtractUniqueValuesSpy,
	objectEquality,
	ObjectEqualitySpy
};
