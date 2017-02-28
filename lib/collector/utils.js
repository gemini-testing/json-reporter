'use strict';

const path = require('path');

exports.getRelativePath = (fullPath) => {
    return fullPath
        ? path.relative(process.cwd(), fullPath)
        : null;
};
