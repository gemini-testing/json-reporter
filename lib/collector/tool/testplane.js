'use strict';

const _ = require('lodash');
const url = require('url');
const utils = require('../utils');

exports.configureTestResult = (result, config) => {
    const filePath = utils.getFilePath(result) || '';
    const testResult = {
        suitePath: utils.getSuitePath(result),
        fullName: result.fullTitle(),
        browserId: result.browserId,
        file: utils.getRelativePath(filePath),
        duration: result.duration || null,
        meta: result.meta,
        startTime: result.startTime
    };

    const metaUrl = _.get(result, 'meta.url', '');
    if (!_.isEmpty(metaUrl)) {
        testResult.url = url.parse(metaUrl).path;
    }

    if (config && config.includeHistory && result.history) {
        testResult.history = result.history;
    }

    return testResult;
};

exports.getSkipReason = (result) => {
    const findSkipReason = (test) => test.parent && findSkipReason(test.parent) || test.skipReason;

    return findSkipReason(result) || 'No skip reason';
};
