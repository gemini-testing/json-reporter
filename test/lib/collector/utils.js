'use strict';

const path = require('path');
const utils = require('../../../lib/collector/utils');

describe('collector/utils', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    describe('getRelativePath', () => {
        it('should return "null" if "fullPath" is not passed', () => {
            assert.isNull(utils.getRelativePath());
        });

        it('should return relative path to cwd', () => {
            sandbox.stub(path, 'relative');

            utils.getRelativePath('/cwd/some-path');

            assert.calledOnce(path.relative);
            assert.calledWith(path.relative, process.cwd(), '/cwd/some-path');
        });
    });

    describe('getSuitePath', () => {
        it('should return empty array when not an object is passed', () => {
            assert.deepEqual(utils.getSuitePath(), []);
        });

        it('should return title when the suite has no parents', () => {
            assert.deepEqual(utils.getSuitePath({title: 'title'}), ['title']);
        });

        it('should return all parent titles when the suite has parents', () => {
            assert.deepEqual(utils.getSuitePath({title: 'title', parent: {title: 'nested'}}), ['nested', 'title']);
        });
    });

    describe('getFilePath', () => {
        it('should return file when the suite has no parents', () => {
            assert.deepEqual(utils.getFilePath({file: '/file'}), '/file');
        });

        it('should return parent file when the suite has no file', () => {
            assert.deepEqual(utils.getFilePath({parent: {file: '/parent'}}), '/parent');
        });
    });
});
