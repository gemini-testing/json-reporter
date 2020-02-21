'use strict';

const _ = require('lodash');

const nonJoinableArrays = ['suitePath'];

function customMerger(objValue, srcValue, key) {
    if (_.isArray(objValue) && !nonJoinableArrays.includes(key)) {
        return objValue.concat(srcValue);
    }
}

module.exports = class DataCollector {
    static create() {
        return new DataCollector();
    }

    constructor() {
        this._data = {};
    }

    append(test) {
        const id = this._generateId(test);

        if (this._data[id]) {
            this._data[id] = _.mergeWith(this._data[id], test, customMerger);
            return;
        }

        this._data[id] = test;
    }

    getData() {
        return this._data;
    }

    _generateId(test) {
        return _(test)
            .at(['fullName', 'browserId'])
            .compact()
            .join('.');
    }
};
