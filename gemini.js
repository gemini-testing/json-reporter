'use strict';

const GeminiCollector = require('./lib/collector/gemini');
const geminiToolCollector = require('./lib/collector/tool/gemini');
const parseConfig = require('./lib/config');

module.exports = (gemini, opts) => {
    const config = parseConfig(opts);

    if (!config.enabled) {
        return;
    }

    const collector = GeminiCollector.create(geminiToolCollector, config);

    gemini.on(gemini.events.BEGIN_STATE, (data) => collector.markTestStart(data));

    gemini.on(gemini.events.TEST_RESULT, (data) => {
        data.equal ? collector.addSuccess(data) : collector.addFail(data);
    });

    gemini.on(gemini.events.SKIP_STATE, (data) => collector.addSkipped(data));

    gemini.on(gemini.events.RETRY, (data) => collector.addRetry(data));

    gemini.on(gemini.events.ERROR, (data) => collector.addError(data));

    gemini.on(gemini.events.END_RUNNER, () => collector.saveFile());
};
