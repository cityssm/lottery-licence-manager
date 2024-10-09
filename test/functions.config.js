import * as assert from 'node:assert';
import * as configFunctions from '../helpers/functions.config.js';
describe('functionConfig', () => {
    describe('#getProperty', () => {
        it('Includes string value for property "licences.externalLicenceNumber.fieldLabel"', () => {
            assert.strictEqual(typeof configFunctions.getProperty('licences.externalLicenceNumber.fieldLabel'), 'string');
        });
    });
    it('getReminderType()', () => {
        assert.strictEqual(configFunctions.getReminderType(''), undefined);
    });
    it('getLicenceType()', () => {
        assert.strictEqual(configFunctions.getLicenceType(''), undefined);
    });
    it('getLicenceTypeKeyToNameObject()', () => {
        assert.ok(configFunctions.getLicenceTypeKeyToNameObject());
    });
});
