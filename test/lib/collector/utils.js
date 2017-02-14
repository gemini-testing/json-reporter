'use strict';

const path = require('path');
const utils = require('../../../lib/collector/utils');

describe('collector/utils', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

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
