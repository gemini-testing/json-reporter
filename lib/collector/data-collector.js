'use strict';

const _ = require('lodash');

module.exports = class DataCollector {
    static create() {
        return new DataCollector();
    }

    constructor() {
        this._data = {};
        this._startTime = {};
    }

    saveStartTime(test) {
        const id = this._generateId(test);
        this._startTime[id] = Date.now();
    }

    append(test) {
        const id = this._generateId(test);

        test.duration = Date.now() - this._startTime[id];
        delete this._startTime[id];

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
