'use strict';

const { ObjectID } = require('mongodb');
const flat = require('flat');
const equal = require('fast-deep-equal');

function isEmptyObject (object) {
  return !object || !Object.keys(object).length;
}

function objectID (id) {
  if (id && !ObjectID.isValid(id)) throw new Error('Invalid id provided');

  return new ObjectID(id);
}

function stripObject (document) {
  return {
    data: document.data,
    lean: document.lean,
    save: document.save,
    remove: document.remove,
    collectionName: document.collectionName,
    schema: document.schema
  };
}

function extractUniqueValues (schema) {
  const result = flat(schema),
    uniqueValues = [];

  for (const field in result) {
    const absolutePath = field.replace(new RegExp('properties.', 'g'), '');
    const parse = absolutePath.split('.');
    const value = result[field];

    if (parse[parse.length - 1] === 'unique' && value) uniqueValues.push(absolutePath.replace('.unique', ''));
  }

  return uniqueValues;
}

function objectEquality (target, source) {
  return equal(target, source);
}

module.exports = { objectEquality, extractUniqueValues, stripObject, objectID, isEmptyObject };
