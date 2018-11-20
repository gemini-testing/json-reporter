'use strict';

const _ = require('lodash');
const geminiToolCollector = require('../../../../lib/collector/tool/gemini');
const utils = require('../../../../lib/collector/utils');

describe('collector/tool/gemini', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    describe('configureTestResult', () => {
        const mkDataStub_ = (opts) => {
            return _.defaults(opts || {}, {
                browserId: 'default-bro',
                refImg: {path: '/default/ref/path'},
                state: {fullName: 'default full name'},
                suite: {
                    file: '/default/path',
                    url: 'http://default/url'
                }
            });
        };

        beforeEach(() => sandbox.stub(utils, 'getRelativePath'));

        it('should try to resolve "referencePath"', () => {
            const data = mkDataStub_({
                refImg: {path: '/cwd/ref/path'}
            });

            geminiToolCollector.configureTestResult(data);

            assert.calledOnceWith(utils.getRelativePath, '/cwd/ref/path');
        });

        it('should return configured result', () => {
            const data = mkDataStub_({
                browserId: 'bro',
                refImg: {path: '/cwd/ref/path'},
                state: {fullName: 'state full name'},
                suite: {
                    file: '/some/file',
                    url: 'http://some-url',
                    fullName: 'suite full name'
                }
            });

            utils.getRelativePath.withArgs('/cwd/ref/path').returns('ref/path');

            const result = geminiToolCollector.configureTestResult(data);

            assert.deepEqual(result, {
                fullName: 'state full name',
                suiteFullName: 'suite full name',
                browserId: 'bro',
                referencePath: 'ref/path',
                file: '/some/file',
                url: 'http://some-url'
            });
        });
    });

    describe('isFailedTest', () => {
        it('should return "true" if result has own property "equal"', () => {
            assert.isTrue(geminiToolCollector.isFailedTest({equal: true}));
        });

        it('should return "false" if result has not property "equal"', () => {
            assert.isFalse(geminiToolCollector.isFailedTest({}));
        });
    });

    describe('getSkipReason', () => {
        it('should return default skip reason if "suite.skipComment" is not specified', () => {
            assert.strictEqual(geminiToolCollector.getSkipReason({}), 'No skip reason');
        });

        it('should return skip reason if "suite.skipComment" is specified', () => {
            const data = {
                suite: {skipComment: 'some-comment'}
            };

            assert.strictEqual(geminiToolCollector.getSkipReason(data), 'some-comment');
        });
    });
});
