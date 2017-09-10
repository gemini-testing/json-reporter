'use strict';

const GeminiDataCollector = require('../../../../lib/collector/data-collector/gemini');

describe('collector/data-collector/gemini', () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers(1);
    });

    afterEach(() => clock.restore());

    it('should has static factory creation method', () => {
        assert.instanceOf(GeminiDataCollector.create(), GeminiDataCollector);
    });

    it('should calculate duration for given test', () => {
        const dataCollector = GeminiDataCollector.create({});

        dataCollector.saveStartTime({fullName: 'name'});
        clock.tick(999);
        dataCollector.append({fullName: 'name'});

        assert.deepEqual(dataCollector.getData(), {
            'name': {fullName: 'name', duration: 999}
        });
    });
});
