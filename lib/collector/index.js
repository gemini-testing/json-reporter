'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
//const fs = Promise.promisifyAll(require('fs-extra'));

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
        this._addTestResult(result, {status: 'success'});
    }

    addFail(result) {
        const {message, stack} = result.err;

        this._addTestResult(result, {
            status: 'fail',
            errorReason: {message, stack},
            retries: [{message, stack}]
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
        console.time('this._dataCollector.getData()');
        const data = this._dataCollector.getData();
        console.timeEnd('this._dataCollector.getData()');

        console.time('JSON.stringify(json-report)');
        const str = JSON.stringify(data);
        console.timeEnd('JSON.stringify(json-report)');

        console.time('write json report file');
        require('fs').writeFileSync(this._config.path, str, 'utf8');
        console.timeEnd('write json report file');

        //return fs.outputJsonAsync(this._config.path, this._dataCollector.getData())
        //    .catch(console.error);
    }

    _addTestResult(result, props) {
        const configuredResult = this._toolCollector.configureTestResult(result);
        const test = _.extend(configuredResult, props);

        this._dataCollector.append(test);
    }
};
