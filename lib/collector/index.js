'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));

const DataCollector = require('./data-collector');

module.exports = class Collector {
    static create(toolCollector, config) {
        return new Collector(toolCollector, config);
    }

    constructor(toolCollector, config) {
        this._toolCollector = toolCollector;
        this._dataCollector = DataCollector.create();
        this._config = config;
    }

    addSuccess(result) {
        this._addTestResult(result, {
            status: 'success',
            skipReason: this._toolCollector.getSkipReason(result)
        });
    }

    addFail(result) {
        const {message, stack} = result.err;

        this._addTestResult(result, {
            status: 'fail',
            errorReason: {message, stack},
            retries: [{message, stack}],
            skipReason: this._toolCollector.getSkipReason(result)
        });
    }

    addSkipped(result) {
        this._addTestResult(result, {
            status: 'skipped',
            skipReason: this._toolCollector.getSkipReason(result)
        });
    }

    addRetry(result) {
        this.addFail(result);
    }

    addError(result) {
        const {message, stack} = result;

        this._addTestResult(result, {
            status: 'error',
            errorReason: {message, stack},
            retries: [{message, stack}]
        });
    }

    saveFile() {
        return fs.outputJsonAsync(this._config.path, this._dataCollector.getData())
            .catch(console.error);
    }

    _addTestResult(result, props) {
        const configuredResult = this._toolCollector.configureTestResult(result);
        const test = _.extend(configuredResult, props);

        this._dataCollector.append(test);
    }
};
