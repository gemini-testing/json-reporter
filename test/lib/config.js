'use strict';

const parseConfig = require('../../lib/config');

describe('config', () => {
    beforeEach(function() {
        this.oldArgv = process.argv;
    });

    afterEach(function() {
        process.argv = this.oldArgv;

        delete process.env['json_reporter_enabled'];
        delete process.env['json_reporter_path'];
    });

    describe('enabled', () => {
        it('should be enabled by default', () => {
            assert.isTrue(parseConfig({}).enabled);
        });

        it('should disable by configuration file', () => {
            const config = parseConfig({enabled: false});

            assert.isFalse(config.enabled);
        });

        it('should disable by cli', () => {
            process.argv = process.argv.concat('--json-reporter-enabled', 'false');

            assert.isFalse(parseConfig({}).enabled);
        });

        it('should disable by environment variable', () => {
            process.env['json_reporter_enabled'] = 'false';

            assert.isFalse(parseConfig({}).enabled);
        });
    });

    describe('path', () => {
        it('should have default value', () => {
            assert.equal(parseConfig({}).path, 'json-reporter.json');
        });

        it('should set from configuration file', () => {
            const config = parseConfig({path: 'config/path/report.json'});

            assert.equal(config.path, 'config/path/report.json');
        });

        it('should set from cli', () => {
            process.argv = process.argv.concat('--json-reporter-path', 'new/path.json');

            assert.equal(parseConfig({}).path, 'new/path.json');
        });

        it('should set from environment variable', () => {
            process.env['json_reporter_path'] = 'env/path/report.json';

            assert.equal(parseConfig({}).path, 'env/path/report.json');
        });
    });
});
