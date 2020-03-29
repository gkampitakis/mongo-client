# Mongo Driver Typescript

[![Build Status](https://travis-ci.org/gkampitakis/MongoDriver.svg?branch=master)](https://travis-ci.org/gkampitakis/MongoDriver)

The purpose of this module is to provide a wrapper for using mongodb functions easier and provide a straightforward way of supporting schema validation.

## Dependencies

-   [Ajv](https://www.npmjs.com/package/ajv)
-   [flat](https://www.npmjs.com/package/flat)
-   [fast-deep-equal](https://www.npmjs.com/package/fast-deep-equal)
-   [kareem](https://www.npmjs.com/package/kareem)
-   [mongodb](https://www.npmjs.com/package/mongodb)

## Installation

First install [Node.js](https://nodejs.org/en/). Then:

`npm i @gkampitakis/mongo-driver --save`

## Importing

```javascript
// Using Node.js `require()`
const { mongoDriver } = require('@gkampitakis/mongo-driver');

//Using ES6 import
import { mongoDriver } from '@gkampitakis/mongo-driver';
```

## Overview

**Connecting to MongoDB**

```javascript
await mongoDriver.connect('mongodb://localhost:27017', 'databaseName', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
```

**Note:** You only have to create the connection once and then have access from anywhere in your application.

## Model

Models are referring to mongo collections

**Defining a Model**

```javascript
const user = Model('user');

// or

const user = Model('user', new Schema());
```

A model gives access to collection manipulation. You can provide a [Schema](#Scehma) on Model initialisation that provides extra functionality as schema [validation](#schema-validation) and [hooks](#hooks).

-   **instance**
    `javascript await model.instance(data);`
    Returns a [Document](#document).
-   **create**
    `javascript await model.create(data,true);`
    Creates an entry to database and
    returns a [Document](#document) or a plain object depending on `lean` **boolean** flag.
-   **deleteOne**
    `javascript await model.deleteOne(filter,true);`
    Deletes the first entry from database that matches the given filter.
-   **findOne**
    `javascript await model.findOne(filter,true);`
    Returns the first entry from database that matches the filter. The return value is either a [Document](#document) or a plain object depending on `lean` **boolean** flag.
-   **updateOne**
    `javascript await model.updateOne(filter,data,true);`
    Updates an entry to database and
    returns a [Document](#document) or a plain object depending on `lean` **boolean** flag.
-   **findByIdAndDelete**
    `javascript await model.findByIdAndDelete(id,true);`
    Deletes an entry from database that has the id given as parameter.
-   **findById**
    `javascript await model.findById(id,true);`
    Returns an entry from database that matches the id given. The return value is either a [Document](#document) or a plain object depending on `lean` **boolean** flag.
-   **findByIdAndUpdate**
    `javascript await model.findByIdAndUpdate(id,updateObject,true);`
    Finds an entry based on the id provided, updates it and return a [Document](#document) or a plain object depending on `lean` **boolean** flag.
-   **deleteMany**
    `javascript await model.deleteMany(filter);`
    Deletes multiples entries from database based on the filter provided.

## Document

The document is the wrapper object for the data. It has the structure:

```json
{
	"collectionName": "users",
	"data": {...},
	"schema": {...},
	"lean": () => object,
	"save": () => Document,
	"remove": () => Document
}
```

-   **data** the actual data saved in the database.
-   **collectionName** the name of the collection where the data are saved.
-   **schema** contains the definition for the schema.
-   **lean** returns the plain object of data.
-   **save** saves the data or updates it.
-   **remove** deletes the entry from the database.

## Schema

The schema has a description about how the data object should look like. It can contain more restrictions about the type of data.

```javascript
const userSchema = new Schema({
	type: 'object',
	properties: {
		username: {
			type: 'string'
		},
		password: {
			type: 'string'
		},
		age: {
			type: 'number'
		}
	},
	required: ['username', 'password']
});
```

### Validation

For the validation of the object [Ajv](https://www.npmjs.com/package/ajv) library is used. The same [syntax](https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md) is used.

When you try to create a new entry with a model that has been initialised with schema, the data are being validated against this schema.

### Hooks

For the hooks the [kareem](https://www.npmjs.com/package/kareem) library is being used. There are two hooks `pre` and `post` and currently 6 supported types ( save, delete, update, remove, create, delete ) and registered in the schema like:

```javascript
const schema = new Schema();

// it is important to be a function and not an arrow function
// cause inside the callback you have access on the context of `hooked` object

schema.pre('save', function() {
	console.log(this.data);
	// or
	console.log(this);

	//depending on **lean** boolean flag
	//if it returns a document or plain object
});

schema.post('save', function() {});
```

## Commands

-   `npm run playground` An example of simple test cases on how to use this module.

-   `npm run playground:mongo` Run the examples on your local mongo instance.

-   `npm run test` Run Jest testing suite.

-   `npm run benchmarks` Run benchmark suite for **Mongo Driver**, **Mongoose** and **Native MongoDb for Nodejs**.
