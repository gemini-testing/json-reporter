'use strict';

const Collector = require('./lib/collector');
const toolCollector = require('./lib/collector/tool/testplane');
const parseConfig = require('./lib/config');

module.exports = (testplane, opts) => {
    const config = parseConfig(opts);

    Object.assign(opts, config);

    if (!config.enabled) {
        return;
    }

    const collector = Collector.create(toolCollector, config);

    testplane.on(testplane.events.TEST_PASS, (data) => collector.addSuccess(data));

    testplane.on(testplane.events.TEST_FAIL, (data) => collector.addFail(data));

    testplane.on(testplane.events.TEST_PENDING, (data) => collector.addSkipped(data));

    testplane.on(testplane.events.RETRY, (data) => collector.addRetry(data));

    testplane.on(testplane.events.ERROR, (err, data) => data && collector.addError(data));

    testplane.on(testplane.events.RUNNER_END, () => collector.saveFile());
};
