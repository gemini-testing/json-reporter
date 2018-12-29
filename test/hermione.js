'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire');

const Collector = require('../lib/collector');
const hermioneToolCollector = require('../lib/collector/tool/hermione');

describe('json-reporter/hermione', () => {
    const sandbox = sinon.sandbox.create();

    let hermione;
    let parseConfig;

    const mkHermione_ = () => {
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

        const hermioneReporter = proxyquire('../hermione', {
            './lib/config': parseConfig
        });

        return hermioneReporter(hermione, opts);
    };

    beforeEach(() => {
        hermione = mkHermione_();
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
            hermioneToolCollector,
            {enabled: true, path: '/some/path'}
        );
    });

    describe('call the appropriate event handlers', () => {
        beforeEach(() => initReporter_());

        it('should call appropriate method for passed test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSuccess');

            hermione.emit(hermione.events.TEST_PASS, data);

            assert.calledOnceWith(Collector.prototype.addSuccess, data);
        });

        it('should call appropriate method for failed test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addFail');

            hermione.emit(hermione.events.TEST_FAIL, data);

            assert.calledOnceWith(Collector.prototype.addFail, data);
        });

        it('should call appropriate method for skipped test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSkipped');

            hermione.emit(hermione.events.TEST_PENDING, data);

            assert.calledOnceWith(Collector.prototype.addSkipped, data);
        });

        it('should call appropriate method for retried test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addRetry');

            hermione.emit(hermione.events.RETRY, data);

            assert.calledOnceWith(Collector.prototype.addRetry, data);
        });

        it('should call appropriate method for error occurred on test execution', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addError');

            hermione.emit(hermione.events.ERROR, 'some error', data);

            assert.calledOnceWith(Collector.prototype.addError, data);
        });

        it('should save collected test data into file when the tests are completed', () => {
            sandbox.stub(Collector.prototype, 'saveFile');

            hermione.emit(hermione.events.RUNNER_END);

            assert.calledOnce(Collector.prototype.saveFile);
        });
    });
});
