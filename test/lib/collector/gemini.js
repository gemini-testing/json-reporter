'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

const GeminiCollector = require('../../../lib/collector/gemini');
const GeminiDataCollector = require('../../../lib/collector/data-collector/gemini');

describe('collector/gemini', () => {
    const sandbox = sinon.sandbox.create();
    let clock;

    const mkToolCollector_ = (opts) => {
        return _.defaults(opts || {}, {
            configureTestResult: (data) => data,
            isFailedTest: sandbox.stub(),
            getSkipReason: sandbox.stub()
        });
    };

    const mkGeminiCollector_ = (toolCollectorOpts, opts) => {
        const toolCollector = mkToolCollector_(toolCollectorOpts);
        const config = _.defaults(opts || {}, {
            path: '/default/path'
        });

        return GeminiCollector.create(toolCollector, config);
    };

    const saveReport_ = (collector) => {
        return collector.saveFile()
            .then(() => fs.outputJsonAsync.firstCall.args[1]);
    };

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        sandbox.stub(fs, 'outputJsonAsync').returns(Promise.resolve());
    });

    afterEach(() => {
        clock.restore();
        sandbox.restore();
    });

    describe('create', () => {
        beforeEach(() => sandbox.stub(GeminiDataCollector, 'create'));

        it('should has static factory creation method', () => {
            assert.instanceOf(GeminiCollector.create(), GeminiCollector);
        });

        it('should create instance of GeminiDataCollector inside the GeminiCollector creation', () => {
            GeminiCollector.create();

            assert.calledOnce(GeminiDataCollector.create);
        });
    });

    describe('markTestStart', () => {
        it('should save test start time in data collector', () => {
            sandbox.stub(GeminiDataCollector.prototype, 'saveStartTime');

            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkGeminiCollector_();

            collector.markTestStart(data);

            assert.calledOnceWith(GeminiDataCollector.prototype.saveStartTime, data);
        });
    });

    describe('should add "duration" time to the', () => {
        it('succesfully passed test', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkGeminiCollector_();

            collector.markTestStart(data);
            collector.addSuccess(data);

            return saveReport_(collector).then((result) => {
                assert.propertyVal(result['some name.bro'], 'duration', 0);
            });
        });

        it('skipped test', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkGeminiCollector_();

            collector.markTestStart(data);
            collector.addSkipped(data);

            return saveReport_(collector).then((result) => {
                assert.propertyVal(result['some name.bro'], 'duration', 0);
            });
        });

        it('failed test', () => {
            const data = {fullName: 'some name', browserId: 'bro', err: new Error('test')};
            const collector = mkGeminiCollector_();

            collector.markTestStart(data);
            collector.addFail(data);

            return saveReport_(collector).then((result) => {
                assert.propertyVal(result['some name.bro'], 'duration', 0);
            });
        });

        it('errored test', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkGeminiCollector_();

            collector.markTestStart(data);
            collector.addError(data);

            return saveReport_(collector).then((result) => {
                assert.propertyVal(result['some name.bro'], 'duration', 0);
            });
        });

        it('errored test if the retry does not fail', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkGeminiCollector_({
                isFailedTest: sandbox.stub().returns(false)
            });

            collector.markTestStart(data);
            collector.addRetry(data);

            return saveReport_(collector).then((result) => {
                assert.propertyVal(result['some name.bro'], 'duration', 0);
            });
        });
    });

    describe('should add on retry', () => {
        it('failed test if the retry fails', () => {
            const testError = new Error('test');
            const data = {fullName: 'some name', browserId: 'bro', err: testError};
            const collector = mkGeminiCollector_({
                isFailedTest: sandbox.stub().returns(true)
            });

            collector.addRetry(data);

            return saveReport_(collector).then((result) => {
                const bro = result['some name.bro'];
                assert.propertyVal(bro, 'status', 'fail');
                assert.deepEqual(bro.errorReason, {message: testError.message, stack: testError.stack});
                assert.deepEqual(bro.retries, [{message: testError.message, stack: testError.stack}]);
            });
        });

        it('errored test if the retry does not fail', () => {
            const data = {fullName: 'some name', browserId: 'bro'};
            const collector = mkGeminiCollector_({
                isFailedTest: sandbox.stub().returns(false)
            });

            collector.addRetry(data);

            return saveReport_(collector).then((result) => {
                const bro = result['some name.bro'];
                assert.propertyVal(bro, 'status', 'error');
                assert.deepEqual(bro.errorReason, {message: undefined, stack: undefined});
                assert.deepEqual(bro.retries, [{message: undefined, stack: undefined}]);
            });
        });

        it('failed test if images are not equal', () => {
            const notEqualErrorMessage = 'Images are not equal';
            const data = {fullName: 'some name', browserId: 'bro', equal: false};
            const collector = mkGeminiCollector_({
                isFailedTest: sandbox.stub().returns(true)
            });

            collector.addRetry(data);

            return saveReport_(collector).then((result) => {
                const bro = result['some name.bro'];
                assert.propertyVal(bro, 'status', 'fail');
                assert.include(bro.errorReason.message, notEqualErrorMessage);
                assert.include(bro.retries[0].message, notEqualErrorMessage);
            });
        });
    });
});
