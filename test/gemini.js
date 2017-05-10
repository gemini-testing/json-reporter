'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire');

const Collector = require('../lib/collector');
const geminiCollector = require('../lib/collector/gemini');
const defaults = require('../lib/constants').defaults;

describe('json-reporter/gemini', () => {
    const sandbox = sinon.sandbox.create();

    let gemini;
    let parseConfig;

    const mkGemini_ = () => {
        const emitter = new EventEmitter();

        emitter.events = {
            TEST_RESULT: 'testResult',
            SKIP_STATE: 'skipState',
            RETRY: 'retry',
            ERROR: 'err',
            END_RUNNER: 'endRunner'
        };

        return emitter;
    };

    const initReporter_ = (opts) => {
        opts = _.defaults(opts || {}, {
            enabled: true,
            path: '/default/path'
        });

        parseConfig = sandbox.stub().returns(opts);

        const geminiReporter = proxyquire('../gemini', {
            'gemini-core': {PluginsConfig: parseConfig}
        });

        return geminiReporter(gemini, opts);
    };

    beforeEach(() => {
        gemini = mkGemini_();
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
            geminiCollector,
            {enabled: true, path: '/some/path'}
        );
    });

    describe('call the appropriate event handlers', () => {
        beforeEach(() => initReporter_());

        it('should call appropriate method for passed test', () => {
            const data = {equal: true};
            sandbox.stub(Collector.prototype, 'addSuccess');

            gemini.emit(gemini.events.TEST_RESULT, data);

            assert.calledOnce(Collector.prototype.addSuccess);
            assert.calledWith(Collector.prototype.addSuccess, data);
        });

        it('should call appropriate method for failed test', () => {
            const data = {equal: false};
            sandbox.stub(Collector.prototype, 'addFail');

            gemini.emit(gemini.events.TEST_RESULT, data);

            assert.calledOnce(Collector.prototype.addFail);
            assert.calledWith(Collector.prototype.addFail, data);
        });

        it('should call appropriate method for skipped test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addSkipped');

            gemini.emit(gemini.events.SKIP_STATE, data);

            assert.calledOnce(Collector.prototype.addSkipped);
            assert.calledWith(Collector.prototype.addSkipped, data);
        });

        it('should call appropriate method for retried test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addRetry');

            gemini.emit(gemini.events.RETRY, data);

            assert.calledOnce(Collector.prototype.addRetry);
            assert.calledWith(Collector.prototype.addRetry, data);
        });

        it('should call appropriate method for error occurred on test execution', () => {
            const data = {foo: 'bar'};
            sandbox.stub(Collector.prototype, 'addError');

            gemini.emit(gemini.events.ERROR, data);

            assert.calledOnce(Collector.prototype.addError);
            assert.calledWith(Collector.prototype.addError, data);
        });

        it('should save collected test data into file when the tests are completed', () => {
            sandbox.stub(Collector.prototype, 'saveFile');

            gemini.emit(gemini.events.END_RUNNER);

            assert.calledOnce(Collector.prototype.saveFile);
        });
    });
});
