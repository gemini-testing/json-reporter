'use strict';

const _ = require('lodash');
const hermioneCollector = require('../../../lib/collector/hermione');
const utils = require('../../../lib/collector/utils');

describe('collector/hermione', () => {
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

            hermioneCollector.configureTestResult(data);

            assert.calledOnce(utils.getRelativePath);
            assert.calledWith(utils.getRelativePath, '/cwd/file/path');
        });

        it('should try to resolve "file" from test result even if it exists in "parent"', () => {
            const data = mkDataStub_({
                file: '/cwd/file/path',
                parent: {file: '/cwd/parent/file/path'}
            });

            hermioneCollector.configureTestResult(data);

            assert.calledOnce(utils.getRelativePath);
            assert.calledWith(utils.getRelativePath, '/cwd/file/path');
        });

        it('should try to resolve "file" from "parent" if it does not exist in test result', () => {
            const data = mkDataStub_({
                file: null,
                parent: {file: '/cwd/parent/file/path'}
            });

            hermioneCollector.configureTestResult(data);

            assert.calledOnce(utils.getRelativePath);
            assert.calledWith(utils.getRelativePath, '/cwd/parent/file/path');
        });

        it('should set url as "null" if "meta.url" is not specified', () => {
            const data = mkDataStub_({
                meta: {}
            });

            const result = hermioneCollector.configureTestResult(data);

            assert.propertyVal(result, 'url', null);
        });

        it('should set "path" property of "meta.url"', () => {
            const data = mkDataStub_({
                meta: {url: 'http://example.com/some-path?query=string'}
            });

            const result = hermioneCollector.configureTestResult(data);

            assert.propertyVal(result, 'url', '/some-path?query=string');
        });

        it('should return configured result', () => {
            const data = mkDataStub_({
                browserId: 'bro',
                fullTitle: () => 'some full title',
                file: '/cwd/file/path',
                meta: {url: 'http://some-url/some-path'}
            });

            utils.getRelativePath.withArgs('/cwd/file/path').returns('file/path');

            const result = hermioneCollector.configureTestResult(data);

            assert.deepEqual(result, {
                fullName: 'some full title',
                browserId: 'bro',
                file: 'file/path',
                url: '/some-path'
            });
        });

        it('should not throw an error if test has no parent', () => {
            assert.doesNotThrow(() => hermioneCollector.configureTestResult(mkDataStub_()));
        });
    });

    describe('isFailedTest', () => {
        it('should return "true" if test is failed', () => {
            assert.isTrue(hermioneCollector.isFailedTest({state: 'failed'}));
        });

        it('should return "true" if hook is failed', () => {
            const result = {hook: {
                state: 'failed'
            }};

            assert.isTrue(hermioneCollector.isFailedTest(result));
        });

        it('should return "false" if test and hook are not failed', () => {
            const result = {hook: {}};

            assert.isFalse(hermioneCollector.isFailedTest(result));
        });
    });

    describe('getSkipReason', () => {
        it('should return default skip reason if "skipReason" is not specified', () => {
            assert.strictEqual(hermioneCollector.getSkipReason({}), 'No skip reason');
        });

        it('should return skip reason from test result', () => {
            const data = {skipReason: 'test-comment'};

            assert.strictEqual(hermioneCollector.getSkipReason(data), 'test-comment');
        });

        it('should return skip reason from "parent" if it does not exist in test result', () => {
            const data = {
                skipReason: null,
                parent: {skipReason: 'suite-comment'}
            };

            assert.strictEqual(hermioneCollector.getSkipReason(data), 'suite-comment');
        });

        it('should return skip reason from "parent" even if it exists in test result', () => {
            const data = {
                skipReason: 'test-comment',
                parent: {skipReason: 'suite-comment'}
            };

            assert.strictEqual(hermioneCollector.getSkipReason(data), 'suite-comment');
        });
    });
});
