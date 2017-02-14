'use strict';

const _ = require('lodash');

module.exports = class DataCollector {
    static create() {
        return new DataCollector();
    }

    constructor() {
        this._data = {};
    }

    append(test) {
        const id = this._generateId(test);
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
