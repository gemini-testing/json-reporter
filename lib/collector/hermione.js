'use strict';

const _ = require('lodash');
const url = require('url');
const utils = require('./utils');

const getFilePath = (test) => test && test.file || getFilePath(test.parent);

exports.configureTestResult = (result) => {
    const filePath = getFilePath(result) || '';
    const metaUrl = _.get(result, 'meta.url', '');

    return {
        fullName: result.fullTitle(),
        browserId: result.browserId,
        file: utils.getRelativePath(filePath),
        url: url.parse(metaUrl).path
    };
};

exports.isFailedTest = (result) => {
    return result.state === 'failed' || result.hook && result.hook.state === 'failed';
};

exports.getSkipReason = (result) => {
    const findSkipReason = (test) => test.parent && findSkipReason(test.parent) || test.skipReason;

    return findSkipReason(result) || 'No skip reason';
};
