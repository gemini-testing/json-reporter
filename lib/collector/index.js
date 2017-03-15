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
        console.log('SUCCESS');
        this._addTestResult(result, {status: 'success'});
    }

    addFail(result) {
        console.log('FAIL');
        this._addTestResult(result, {status: 'fail'});
    }

    addSkipped(result) {
        console.log('SKIPPED');
        this._addTestResult(result, {
            status: 'skipped',
            skipReason: this._toolCollector.getSkipReason(result)
        });
    }

    addRetry(result) {
        console.log('RETRY');
        this._toolCollector.isFailedTest(result)
            ? this.addFail(result)
            : this.addError(result);
    }

    addError(result) {
        console.log('ERROR');
        this._addTestResult(result, {
            status: 'error',
            errorReason: result.stack || result.message || ''
        });
    }

    saveFile() {
        console.log('SAVE');
        return fs.outputJsonAsync(this._config.path, this._dataCollector.getData())
            .catch(console.error);
    }

    _addTestResult(result, props) {
        const configuredResult = this._toolCollector.configureTestResult(result);
        const test = _.extend(configuredResult, props);

        this._dataCollector.append(test);
    }
};
