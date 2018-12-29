'use strict';

const DataCollector = require('./');

module.exports = class GeminiDataCollector extends DataCollector {
    static create() {
        return new GeminiDataCollector();
    }

    constructor() {
        super();
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

        super.append(test);
    }
};
