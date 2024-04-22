'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire');

const Collector = require('../lib/collector');
const toolCollector = require('../lib/collector/tool/testplane');

describe('json-reporter/plugin', () => {
    const sandbox = sinon.sandbox.create();

    let testplane;
    let parseConfig;

    const mkTestplane_ = () => {
        const emitter = new EventEmitter();

        emitter.events = {
            TEST_PASS: 'passTest',
            TEST_FAIL: 'failTest',
            SUITE_FAIL: 'failSuite',
            TEST_PENDING: 'pendingTest',
            RETRY: 'retry',
            ERROR: 'err',
            RUNNER_END: 'endRunner',
            TEST_END: 'endTest'
        };

        return emitter;
    };

    const initReporter_ = (opts) => {
        opts = _.defaults(opts || {}, {
            enabled: true,
            path: '/default/path'
        });

        parseConfig = sandbox.stub().returns(opts);

        const reporter = proxyquire('../plugin', {
            './lib/config': parseConfig
        });

        return reporter(testplane, opts);
    };

    beforeEach(() => {
        testplane = mkTestplane_();
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if plugin is disabled', () => {
        sandbox.stub(Collector, 'create');

        initReporter_({enabled: false});

        assert.notCalled(Collector.create);
    });

    it('should parse config', () => {
        initReporter_({enabled: true, path: '/some/path'});

        assert.calledOnce(parseConfig);
        assert.calledWithMatch(parseConfig, {enabled: true, path: '/some/path'});
    });

    it('should create collector', () => {
        sandbox.stub(Collector, 'create');

        initReporter_({enabled: true, path: '/some/path'});

        assert.calledWith(
            Collector.create,
            toolCollector,
            {enabled: true, path: '/some/path'}
        );
    });

    describe('call the appropriate event handlers', () => {
        beforeEach(() => initReporter_());

        it('should call appropriate method for passed test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSuccess');

            testplane.emit(testplane.events.TEST_PASS, data);

            assert.calledOnceWith(Collector.prototype.addSuccess, data);
        });

        it('should call appropriate method for failed test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addFail');

            testplane.emit(testplane.events.TEST_FAIL, data);

            assert.calledOnceWith(Collector.prototype.addFail, data);
        });

        it('should call appropriate method for skipped test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSkipped');

            testplane.emit(testplane.events.TEST_PENDING, data);

            assert.calledOnceWith(Collector.prototype.addSkipped, data);
        });

        it('should call appropriate method for retried test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addRetry');

            testplane.emit(testplane.events.RETRY, data);

            assert.calledOnceWith(Collector.prototype.addRetry, data);
        });

        it('should call appropriate method for error occurred on test execution', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addError');

            testplane.emit(testplane.events.ERROR, 'some error', data);

            assert.calledOnceWith(Collector.prototype.addError, data);
        });

        it('should do nothing for error which occurred without data', () => {
            sandbox.stub(Collector.prototype, 'addError');

            testplane.emit(testplane.events.ERROR, 'some error');

            assert.notCalled(Collector.prototype.addError);
        });

        it('should save collected test data into file when the tests are completed', () => {
            sandbox.stub(Collector.prototype, 'saveFile');

            testplane.emit(testplane.events.RUNNER_END);

            assert.calledOnce(Collector.prototype.saveFile);
        });
    });
});
