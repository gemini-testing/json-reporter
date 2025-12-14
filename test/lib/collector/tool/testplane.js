'use strict';

const _ = require('lodash');
const toolCollector = require('../../../../lib/collector/tool/testplane');
const utils = require('../../../../lib/collector/utils');

describe('collector/tool/testplane', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    describe('configureTestResult', () => {
        const mkDataStub_ = (opts) => {
            return _.defaults(opts || {}, {
                browserId: 'default-bro',
                fullTitle: () => 'default full title',
                meta: {url: 'http://default/url'}
            });
        };

        beforeEach(() => sandbox.stub(utils, 'getRelativePath'));

        it('should try to resolve "file" from test result', () => {
            const data = mkDataStub_({file: '/cwd/file/path'});

            toolCollector.configureTestResult(data);

            assert.calledOnceWith(utils.getRelativePath, '/cwd/file/path');
        });

        it('should try to resolve "file" from test result even if it exists in "parent"', () => {
            const data = mkDataStub_({
                file: '/cwd/file/path',
                parent: {file: '/cwd/parent/file/path'}
            });

            toolCollector.configureTestResult(data);

            assert.calledOnceWith(utils.getRelativePath, '/cwd/file/path');
        });

        it('should try to resolve "file" from "parent" if it does not exist in test result', () => {
            const data = mkDataStub_({
                file: null,
                parent: {file: '/cwd/parent/file/path'}
            });

            toolCollector.configureTestResult(data);

            assert.calledOnceWith(utils.getRelativePath, '/cwd/parent/file/path');
        });

        it('should not set url if "meta.url" is not specified', () => {
            const data = mkDataStub_({
                meta: {}
            });

            const result = toolCollector.configureTestResult(data);

            assert.notProperty(result, 'url');
        });

        it('should set "path" property of "meta.url"', () => {
            const data = mkDataStub_({
                meta: {url: 'http://example.com/some-path?query=string'}
            });

            const result = toolCollector.configureTestResult(data);

            assert.propertyVal(result, 'url', '/some-path?query=string');
        });

        it('should set "duration" to "null" if it does not specify', () => {
            const data = mkDataStub_();

            const result = toolCollector.configureTestResult(data);

            assert.propertyVal(result, 'duration', null);
        });

        it('should return configured result', () => {
            const data = mkDataStub_({
                title: 'title',
                browserId: 'bro',
                fullTitle: () => 'some full title',
                file: '/cwd/file/path',
                meta: {url: 'http://some-url/some-path', foo: 'bar'},
                duration: 12345,
                parent: mkDataStub_({title: 'some full'}),
                startTime: 1000
            });

            utils.getRelativePath.withArgs('/cwd/file/path').returns('file/path');

            const result = toolCollector.configureTestResult(data);

            assert.deepEqual(result, {
                suitePath: ['some full', 'title'],
                fullName: 'some full title',
                browserId: 'bro',
                file: 'file/path',
                url: '/some-path',
                meta: {url: 'http://some-url/some-path', foo: 'bar'},
                duration: 12345,
                startTime: 1000
            });
        });

        it('should not throw an error if test has no parent', () => {
            assert.doesNotThrow(() => toolCollector.configureTestResult(mkDataStub_()));
        });

        it('should not add history if includeHistory is not enabled', () => {
            const testSteps = [
                {n: 'click', a: ['.button'], ts: 1000, te: 1050, d: 50, s: 'b', c: [], o: false, g: false, f: false}
            ];
            const data = mkDataStub_({
                history: testSteps
            });

            const result = toolCollector.configureTestResult(data, {includeHistory: false});

            assert.notProperty(result, 'history');
        });

        it('should add history if includeHistory is enabled and history exists', () => {
            const testSteps = [
                {
                    n: 'click',
                    a: ['.button'],
                    ts: 1000,
                    te: 1050,
                    d: 50,
                    s: 'b',
                    c: [
                        {n: 'wait', a: [], ts: 1005, te: 1045, d: 40, s: 'b', c: [], o: false, g: false, f: false}
                    ],
                    o: false,
                    g: true,
                    f: false
                },
                {
                    n: 'type',
                    a: ['.input', 'text'],
                    ts: 1100,
                    te: 1150,
                    d: 50,
                    s: 'e',
                    c: [],
                    o: false,
                    g: false,
                    f: false
                }
            ];
            const data = mkDataStub_({
                history: testSteps
            });

            const result = toolCollector.configureTestResult(data, {includeHistory: true});

            assert.propertyVal(result, 'history', testSteps);
            assert.isArray(result.history);
        });

        it('should not add history if includeHistory is enabled but history does not exist', () => {
            // @note history is not available for skipped tests and may be undefined
            const data = mkDataStub_();

            const result = toolCollector.configureTestResult(data, {includeHistory: true});

            assert.notProperty(result, 'history');
        });
    });

    describe('getSkipReason', () => {
        it('should return default skip reason if "skipReason" is not specified', () => {
            assert.strictEqual(toolCollector.getSkipReason({}), 'No skip reason');
        });

        it('should return skip reason from test result', () => {
            const data = {skipReason: 'test-comment'};

            assert.strictEqual(toolCollector.getSkipReason(data), 'test-comment');
        });

        it('should return skip reason from "parent" if it does not exist in test result', () => {
            const data = {
                skipReason: null,
                parent: {skipReason: 'suite-comment'}
            };

            assert.strictEqual(toolCollector.getSkipReason(data), 'suite-comment');
        });

        it('should return skip reason from "parent" even if it exists in test result', () => {
            const data = {
                skipReason: 'test-comment',
                parent: {skipReason: 'suite-comment'}
            };

            assert.strictEqual(toolCollector.getSkipReason(data), 'suite-comment');
        });
    });
});
