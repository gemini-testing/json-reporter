'use strict';

const Collector = require('./lib/collector');
const hermioneToolCollector = require('./lib/collector/tool/hermione');
const parseConfig = require('./lib/config');

module.exports = (hermione, opts) => {
    const config = parseConfig(opts);

    if (!config.enabled) {
        return;
    }

    const collector = Collector.create(hermioneToolCollector, config);

    hermione.on(hermione.events.TEST_PASS, (data) => collector.addSuccess(data));

    hermione.on(hermione.events.TEST_FAIL, (data) => collector.addFail(data));

    hermione.on(hermione.events.TEST_PENDING, (data) => collector.addSkipped(data));

    hermione.on(hermione.events.RETRY, (data) => collector.addRetry(data));

    hermione.on(hermione.events.ERROR, (err, data) => data && collector.addError(data));

    hermione.on(hermione.events.RUNNER_END, () => collector.saveFile());
};
