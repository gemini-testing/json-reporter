'use strict';

const Collector = require('./lib/collector');
const hermioneCollector = require('./lib/collector/hermione');
const parseConfig = require('gemini-core').PluginsConfig;
const defaults = require('./lib/constants').defaults;

module.exports = (hermione, opts) => {
    const config = parseConfig(opts, defaults);
    if (!config.enabled) {
        return;
    }

    const collector = Collector.create(hermioneCollector, config);

    hermione.on(hermione.events.TEST_PASS, (data) => collector.addSuccess(data));

    hermione.on(hermione.events.TEST_FAIL, (data) => collector.addFail(data));
    hermione.on(hermione.events.SUITE_FAIL, (data) => collector.addFail(data));

    hermione.on(hermione.events.TEST_PENDING, (data) => collector.addSkipped(data));

    hermione.on(hermione.events.RETRY, (data) => collector.addRetry(data));

    hermione.on(hermione.events.ERROR, (err, data) => collector.addError(data));

    hermione.on(hermione.events.RUNNER_END, () => collector.saveFile());
};
