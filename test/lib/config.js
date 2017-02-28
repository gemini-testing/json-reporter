'use strict';

const parseConfig = require('../../lib/config');

describe('config', () => {
    afterEach(() => delete process.env['json_reporter_path']);

    it('should be enabled by default', () => {
        assert.equal(parseConfig({}).enabled, true);
    });

    describe('json report file path', () => {
        it('should set from configuration file', () => {
            const config = parseConfig({path: 'config/path/report.json'});

            assert.equal(config.path, 'config/path/report.json');
        });

        it('should set from environment variable', () => {
            process.env['json_reporter_path'] = 'env/path/report.json';

            assert.equal(parseConfig({}).path, 'env/path/report.json');
        });
    });
});
