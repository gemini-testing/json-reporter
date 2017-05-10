'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire');

const Collector = require('../lib/collector');
const hermioneCollector = require('../lib/collector/hermione');
const defaults = require('../lib/constants').defaults;

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
            RUNNER_END: 'endRunner'
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
            'gemini-core': {PluginsConfig: parseConfig}
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
        assert.calledWithMatch(parseConfig, {enabled: true, path: '/some/path'}, defaults);
    });

    it('should create collector', () => {
        sandbox.stub(Collector, 'create');

        initReporter_({enabled: true, path: '/some/path'});

        assert.calledWith(
            Collector.create,
            hermioneCollector,
            {enabled: true, path: '/some/path'}
        );
    });

    describe('call the appropriate event handlers', () => {
        beforeEach(() => initReporter_());

        it('should call appropriate method for passed test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSuccess');

            hermione.emit(hermione.events.TEST_PASS, data);

            assert.calledOnce(Collector.prototype.addSuccess);
            assert.calledWith(Collector.prototype.addSuccess, data);
        });

        ['TEST_FAIL', 'SUITE_FAIL'].forEach((eventName) => {
            it('should call appropriate method for failed test', () => {
                const data = {foo: 'bar'};
                sandbox.stub(Collector.prototype, 'addFail');

                hermione.emit(hermione.events[eventName], data);

                assert.calledOnce(Collector.prototype.addFail);
                assert.calledWith(Collector.prototype.addFail, data);
            });
        });

        it('should call appropriate method for skipped test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSkipped');

            hermione.emit(hermione.events.TEST_PENDING, data);

            assert.calledOnce(Collector.prototype.addSkipped);
            assert.calledWith(Collector.prototype.addSkipped, data);
        });

        it('should call appropriate method for retried test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addRetry');

            hermione.emit(hermione.events.RETRY, data);

            assert.calledOnce(Collector.prototype.addRetry);
            assert.calledWith(Collector.prototype.addRetry, data);
        });

        it('should call appropriate method for error occurred on test execution', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addError');

            hermione.emit(hermione.events.ERROR, 'some error', data);

            assert.calledOnce(Collector.prototype.addError);
            assert.calledWith(Collector.prototype.addError, data);
        });

        it('should save collected test data into file when the tests are completed', () => {
            sandbox.stub(Collector.prototype, 'saveFile');

            hermione.emit(hermione.events.RUNNER_END);

            assert.calledOnce(Collector.prototype.saveFile);
        });
    });
});
