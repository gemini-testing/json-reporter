'use strict';

const _ = require('lodash');
const utils = require('../utils');

exports.configureTestResult = (result) => {
    return {
        fullName: result.state.fullName,
        suiteFullName: result.suite.fullName,
        browserId: result.browserId,
        file: result.suite.file,
        referencePath: utils.getRelativePath(_.get(result, 'refImg.path')),
        url: result.suite.url
    };
};

exports.isFailedTest = (result) => {
    return result.hasOwnProperty('equal');
};

exports.getSkipReason = (result) => {
    return _.get(result, 'suite.skipComment', 'No skip reason');
};
