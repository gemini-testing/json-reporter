'use strict';

const path = require('path');

exports.getRelativePath = (fullPath) => {
    return fullPath
        ? path.relative(process.cwd(), fullPath)
        : null;
};

exports.getSuitePath = getSuitePath;
function getSuitePath(suite) {
    return (!suite || suite.root) ? [] : [].concat(getSuitePath(suite.parent)).concat(suite.title);
}

exports.getFilePath = getFilePath;
function getFilePath(test) {
    return test && (test.file || getFilePath(test.parent));
}
