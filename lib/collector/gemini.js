'use strict';

const Collector = require('./');
const GeminiDataCollector = require('./data-collector/gemini');

module.exports = class GeminiCollector extends Collector {
    static create(toolCollector, config) {
        return new GeminiCollector(toolCollector, config);
    }

    constructor(toolCollector, config) {
        super(toolCollector, config);
        this._dataCollector = GeminiDataCollector.create();
    }

    markTestStart(result) {
        const test = this._toolCollector.configureTestResult(result);
        this._dataCollector.saveStartTime(test);
    }
};
