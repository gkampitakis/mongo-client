'use strict';

const { stripObject } = require('../utils/Utils');
const kareem = require('kareem');
const Ajv = require('ajv');

class Schema {
  _schema;
  hooks;
  validator;

  constructor (schema, options) {
    this._schema = schema;
    this.hooks = new kareem();
    const ajv = new Ajv({ ...options, ...{ useDefaults: true, removeAdditional: true } });
    if (schema) this.validator = ajv.compile(schema);
  }

  get hasPreHooks () {
    return this.hooks._pres.size > 0;
  }

  get hasPostHooks () {
    return this.hooks._posts.size > 0;
  }

  get schemaDefinition () {
    return this._schema;
  }

  post (hook, callback) {
    this.hooks.post(hook, callback);
  }

  pre (hook, callback) {
    this.hooks.pre(hook, callback);
  }

  executePreHooks (hook, context, lean) {
    return new Promise(resolve => {
      if (this.hooks._pres.size <= 0) return resolve();
      this.hooks.execPre(hook, lean ? context : stripObject(context), [context], () => {
        resolve();
      });
    });
  }

  executePostHooks (hook, context, lean) {
    return new Promise(resolve => {
      if (this.hooks._posts.size <= 0) return resolve();
      this.hooks.execPost(hook, lean ? context : stripObject(context), [context], () => {
        resolve();
      });
    });
  }

  validate (data) {
    if (!this._schema) return data;
    if (!this.validator(data)) {
      throw new Error(this.getError(this.validator.errors[0]));
    }

    return data;
  }

  getError (errorObject) {
    return `[${errorObject.keyword}] ${errorObject.dataPath} - ${errorObject.message}`;
  }
}

module.exports = {
  Schema
};
