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
