import { Router } from 'express';
import handler_activeSummary from '../handlers/licences-get/activeSummary.js';
import handler_edit from '../handlers/licences-get/edit.js';
import handler_licenceTypes from '../handlers/licences-get/licenceTypes.js';
import handler_new from '../handlers/licences-get/new.js';
import handler_poke from '../handlers/licences-get/poke.js';
import handler_print from '../handlers/licences-get/print.js';
import handler_view from '../handlers/licences-get/view.js';
import handler_doAddTransaction from '../handlers/licences-post/doAddTransaction.js';
import handler_doDelete from '../handlers/licences-post/doDelete.js';
import handler_doGetDistinctTermsConditions from '../handlers/licences-post/doGetDistinctTermsConditions.js';
import handler_doGetTicketTypes from '../handlers/licences-post/doGetTicketTypes.js';
import handler_doIssueLicence from '../handlers/licences-post/doIssueLicence.js';
import handler_doSave from '../handlers/licences-post/doSave.js';
import handler_doSearch from '../handlers/licences-post/doSearch.js';
import handler_doUnissueLicence from '../handlers/licences-post/doUnissueLicence.js';
import handler_doVoidTransaction from '../handlers/licences-post/doVoidTransaction.js';
import * as permissionHandlers from '../handlers/permissions.js';
import * as licencesDB from '../helpers/licencesDB.js';
export const router = Router();
router.get('/', (_request, response) => {
    response.render('licence-search', {
        headTitle: 'Lottery Licences'
    });
});
router.post('/doSearch', handler_doSearch);
router.get('/licenceTypes', handler_licenceTypes);
router.post('/doGetLicenceTypeSummary', (request, response) => {
    response.json(licencesDB.getLicenceTypeSummary(request.body));
});
router.get('/activeSummary', handler_activeSummary);
router.post('/doGetActiveLicenceSummary', (request, response) => {
    response.json(licencesDB.getActiveLicenceSummary(request.body, request.session));
});
router.get(['/new', '/new/:organizationID'], permissionHandlers.createGetHandler, handler_new);
router.post('/doGetDistinctTermsConditions', handler_doGetDistinctTermsConditions);
router.post('/doGetTicketTypes', handler_doGetTicketTypes);
router.post('/doSave', permissionHandlers.createPostHandler, handler_doSave);
router.post('/doAddTransaction', permissionHandlers.createPostHandler, handler_doAddTransaction);
router.post('/doVoidTransaction', permissionHandlers.createPostHandler, handler_doVoidTransaction);
router.post('/doIssueLicence', permissionHandlers.createPostHandler, handler_doIssueLicence);
router.post('/doUnissueLicence', permissionHandlers.createPostHandler, handler_doUnissueLicence);
router.post('/doDelete', permissionHandlers.createPostHandler, handler_doDelete);
router.get('/:licenceID', handler_view);
router.get('/:licenceID/edit', permissionHandlers.createGetHandler, handler_edit);
router.get('/:licenceID/print', handler_print);
router.get('/:licenceID/poke', permissionHandlers.adminGetHandler, handler_poke);
export default router;
