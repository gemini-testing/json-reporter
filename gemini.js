'use strict';

const Collector = require('./lib/collector');
const geminiCollector = require('./lib/collector/gemini');
const parseConfig = require('gemini-core').PluginsConfig;
const defaults = require('./lib/constants').defaults;

module.exports = (gemini, opts) => {
    const config = parseConfig(opts, defaults);

    if (!config.enabled) {
        return;
    }

    const collector = Collector.create(geminiCollector, config);

    gemini.on(gemini.events.TEST_RESULT, (data) => {
        data.equal ? collector.addSuccess(data) : collector.addFail(data);
    });

    gemini.on(gemini.events.SKIP_STATE, (data) => collector.addSkipped(data));

    gemini.on(gemini.events.RETRY, (data) => collector.addRetry(data));

    gemini.on(gemini.events.ERROR, (data) => collector.addError(data));

    gemini.on(gemini.events.END_RUNNER, () => collector.saveFile());
};
