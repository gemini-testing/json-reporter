'use strict';

const DataCollector = require('../../../lib/collector/data-collector');

describe('collector/data-collector', () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers(1);
    });

    afterEach(() => clock.restore());

    it('should has static factory creation method', () => {
        assert.instanceOf(DataCollector.create(), DataCollector);
    });

    describe('should append a test to data collector', () => {
        it('with empty id', () => {
            const dataCollector = DataCollector.create({});

            dataCollector.saveStartTime({foo: 'bar'});
            dataCollector.append({foo: 'bar'});

            assert.deepEqual(dataCollector.getData(), {
                '': {foo: 'bar', duration: 0}
            });
        });

        it('with an id value "fullName"', () => {
            const dataCollector = DataCollector.create({});

            dataCollector.saveStartTime({fullName: 'name'});
            dataCollector.append({fullName: 'name'});

            assert.deepEqual(dataCollector.getData(), {
                'name': {fullName: 'name', duration: 0}
            });
        });

        it('with an id value "browserId"', () => {
            const dataCollector = DataCollector.create({});

            dataCollector.saveStartTime({browserId: 'bro'});
            dataCollector.append({browserId: 'bro'});

            assert.deepEqual(dataCollector.getData(), {
                'bro': {browserId: 'bro', duration: 0}
            });
        });

        it('with an id value "fullName.browserId"', () => {
            const dataCollector = DataCollector.create({});

            dataCollector.saveStartTime({fullName: 'name', browserId: 'bro'});
            dataCollector.append({fullName: 'name', browserId: 'bro'});

            assert.deepEqual(dataCollector.getData(), {
                'name.bro': {fullName: 'name', browserId: 'bro', duration: 0}
            });
        });
    });

    it('should replace the existing test in data collector', () => {
        const dataCollector = DataCollector.create({});

        dataCollector.saveStartTime({foo: 'bar'});
        dataCollector.append({foo: 'bar'});
        dataCollector.saveStartTime({foo: 'baz'});
        dataCollector.append({foo: 'baz'});

        assert.deepEqual(dataCollector.getData(), {
            '': {foo: 'baz', duration: 0}
        });
    });

    it('should calculate duration for given test', () => {
        const dataCollector = DataCollector.create({});

        dataCollector.saveStartTime({fullName: 'name'});
        clock.tick(999);
        dataCollector.append({fullName: 'name'});

        assert.deepEqual(dataCollector.getData(), {
            'name': {fullName: 'name', duration: 999}
        });
    });
});
