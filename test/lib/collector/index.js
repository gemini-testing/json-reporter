'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

const Collector = require('../../../lib/collector');
const DataCollector = require('../../../lib/collector/data-collector');

describe('collector/index', () => {
    const sandbox = sinon.sandbox.create();

    const mkToolCollector_ = (opts) => {
        return _.defaults(opts || {}, {
            configureTestResult: (data) => {
                delete data.err;
                return data;
            },
            getSkipReason: sandbox.stub()
        });
    };

    const mkCollector_ = (toolCollectorOpts, opts) => {
        const toolCollector = mkToolCollector_(toolCollectorOpts);
        const config = _.defaults(opts || {}, {
            path: '/default/path'
        });

        return Collector.create(toolCollector, config);
    };

    afterEach(() => sandbox.restore());

    describe('create', () => {
        beforeEach(() => sandbox.stub(DataCollector, 'create'));

        it('should has static factory creation method', () => {
            assert.instanceOf(Collector.create(), Collector);
        });

        it('should create instance of DataCollector inside the Collector creation', () => {
            Collector.create();

            assert.calledOnce(DataCollector.create);
        });
    });

    describe('collect the results of the passed tests', () => {
        const saveReport_ = (collector) => {
            return collector.saveFile()
                .then(() => fs.outputJsonAsync.firstCall.args[1]);
        };

        beforeEach(() => {
            sandbox.stub(fs, 'outputJsonAsync').returns(Promise.resolve());
        });

        it('should add succesfully passed test', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkCollector_();

            collector.addSuccess(data);

            return saveReport_(collector).then((result) => {
                assert.deepEqual(result, {
                    'some name.bro': {
                        fullName: 'some name',
                        browserId: 'bro',
                        status: 'success'
                    }});
            });
        });

        it('should add failed test', () => {
            const testError = new Promise.OperationalError('test');
            const data = {fullName: 'some name', browserId: 'bro', err: testError};
            const collector = mkCollector_();

            collector.addFail(data);

            return saveReport_(collector).then((result) => {
                assert.deepEqual(result, {'some name.bro': {
                    fullName: 'some name',
                    browserId: 'bro',
                    status: 'fail',
                    errorReason: {message: testError.message, stack: testError.stack},
                    retries: [{message: testError.message, stack: testError.stack}]
                }});
            });
        });

        it('should add skipped test', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkCollector_({
                getSkipReason: sandbox.stub().returns('some-reason')
            });

            collector.addSkipped(data);

            return saveReport_(collector).then((result) => {
                assert.deepEqual(result, {'some name.bro': {
                    fullName: 'some name',
                    browserId: 'bro',
                    status: 'skipped',
                    skipReason: 'some-reason'
                }});
            });
        });

        it('should add failed test if the retry fails', () => {
            const testError = new Promise.OperationalError('test');
            const data = {fullName: 'some name', browserId: 'bro', err: testError};
            const collector = mkCollector_();

            collector.addRetry(data);

            return saveReport_(collector).then((result) => {
                assert.deepEqual(result, {'some name.bro': {
                    fullName: 'some name',
                    browserId: 'bro',
                    status: 'fail',
                    errorReason: {message: testError.message, stack: testError.stack},
                    retries: [{message: testError.message, stack: testError.stack}]
                }});
            });
        });

        it('should add errored test with reason from "message"', () => {
            const data = {fullName: 'some name', browserId: 'bro', message: 'err-msg'};
            const collector = mkCollector_();

            collector.addError(data);

            return saveReport_(collector)
                .then((result) => assert.deepPropertyVal(result['some name.bro'], 'errorReason.message', 'err-msg'));
        });

        it('should add errored test with reason from "stack"', () => {
            const data = {fullName: 'some name', browserId: 'bro', message: 'err-msg', stack: 'stack-msg'};
            const collector = mkCollector_();

            collector.addError(data);

            return saveReport_(collector)
                .then((result) => assert.deepPropertyVal(result['some name.bro'], 'errorReason.stack', 'stack-msg'));
        });
    });

    describe('saveFile', () => {
        beforeEach(() => sandbox.stub(fs, 'outputJsonAsync'));

        it('should save json file on file system for given file path', () => {
            fs.outputJsonAsync.returns(Promise.resolve());

            const collector = mkCollector_({}, {path: '/some-folder/file.json'});

            return collector.saveFile()
                .then(() => assert.calledWith(fs.outputJsonAsync, '/some-folder/file.json'));
        });

        it('should show an error if error occurred on saving file', () => {
            fs.outputJsonAsync.returns(Promise.reject('some-error'));
            sandbox.stub(console, 'error');

            const collector = mkCollector_({});

            return collector.saveFile()
                .then(() => assert.calledWith(console.error, 'some-error'));
        });
    });
});
