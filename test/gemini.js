'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire');

const GeminiCollector = require('../lib/collector/gemini');
const geminiToolCollector = require('../lib/collector/tool/gemini');

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
            END_RUNNER: 'endRunner',
            BEGIN_STATE: 'beginState',
            END_STATE: 'endState'
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
            './lib/config': parseConfig
        });

        return geminiReporter(gemini, opts);
    };

    beforeEach(() => {
        gemini = mkGemini_();
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if plugin is disabled', () => {
        sandbox.stub(GeminiCollector, 'create');

        initReporter_({enabled: false});

        assert.notCalled(GeminiCollector.create);
    });

    it('should parse config', () => {
        initReporter_({enabled: true, path: '/some/path'});

        assert.calledOnce(parseConfig);
        assert.calledWithMatch(parseConfig, {enabled: true, path: '/some/path'});
    });

    it('should create collector', () => {
        sandbox.stub(GeminiCollector, 'create');

        initReporter_({enabled: true, path: '/some/path'});

        assert.calledWith(
            GeminiCollector.create,
            geminiToolCollector,
            {enabled: true, path: '/some/path'}
        );
    });

    describe('call the appropriate event handlers', () => {
        beforeEach(() => initReporter_());

        it('should call appropriate method on test start', () => {
            const data = {foo: 'bar'};

            sandbox.stub(GeminiCollector.prototype, 'markTestStart');
            gemini.emit(gemini.events.BEGIN_STATE, data);

            assert.calledOnceWith(GeminiCollector.prototype.markTestStart, data);
        });

        it('should call appropriate method for passed test', () => {
            const data = {equal: true};
            sandbox.stub(GeminiCollector.prototype, 'addSuccess');

            gemini.emit(gemini.events.TEST_RESULT, data);

            assert.calledOnceWith(GeminiCollector.prototype.addSuccess, data);
        });

        it('should call appropriate method for failed test', () => {
            const data = {equal: false};
            sandbox.stub(GeminiCollector.prototype, 'addFail');

            gemini.emit(gemini.events.TEST_RESULT, data);

            assert.calledOnceWith(GeminiCollector.prototype.addFail, data);
        });

        it('should call appropriate method for skipped test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(GeminiCollector.prototype, 'addSkipped');

            gemini.emit(gemini.events.SKIP_STATE, data);

            assert.calledOnceWith(GeminiCollector.prototype.addSkipped, data);
        });

        it('should call appropriate method for retried test', () => {
            const data = {foo: 'bar'};
            sandbox.stub(GeminiCollector.prototype, 'addRetry');

            gemini.emit(gemini.events.RETRY, data);

            assert.calledOnceWith(GeminiCollector.prototype.addRetry, data);
        });

        it('should call appropriate method for error occurred on test execution', () => {
            const data = {foo: 'bar'};
            sandbox.stub(GeminiCollector.prototype, 'addError');

            gemini.emit(gemini.events.ERROR, data);

            assert.calledOnceWith(GeminiCollector.prototype.addError, data);
        });

        it('should save collected test data into file when the tests are completed', () => {
            sandbox.stub(GeminiCollector.prototype, 'saveFile');

            gemini.emit(gemini.events.END_RUNNER);

            assert.calledOnce(GeminiCollector.prototype.saveFile);
        });
    });
});
