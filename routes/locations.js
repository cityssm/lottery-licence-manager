import { Router } from 'express';
import handler_cleanup from '../handlers/locations-get/cleanup.js';
import handler_edit from '../handlers/locations-get/edit.js';
import handler_new from '../handlers/locations-get/new.js';
import handler_view from '../handlers/locations-get/view.js';
import handler_doCreate from '../handlers/locations-post/doCreate.js';
import handler_doDelete from '../handlers/locations-post/doDelete.js';
import handler_doGetInactive from '../handlers/locations-post/doGetInactive.js';
import handler_doGetLocations from '../handlers/locations-post/doGetLocations.js';
import handler_doMerge from '../handlers/locations-post/doMerge.js';
import handler_doRestore from '../handlers/locations-post/doRestore.js';
import handler_doUpdate from '../handlers/locations-post/doUpdate.js';
import * as permissionHandlers from '../handlers/permissions.js';
export const router = Router();
router.get('/', (_request, response) => {
    response.render('location-search', {
        headTitle: 'Locations'
    });
});
router.post('/doGetLocations', handler_doGetLocations);
router.get('/cleanup', permissionHandlers.updateGetHandler, handler_cleanup);
router.post('/doGetInactive', handler_doGetInactive);
router.post('/doCreate', permissionHandlers.createPostHandler, handler_doCreate);
router.post('/doUpdate', permissionHandlers.createPostHandler, handler_doUpdate);
router.post('/doDelete', permissionHandlers.createPostHandler, handler_doDelete);
router.post('/doRestore', permissionHandlers.updatePostHandler, handler_doRestore);
router.post('/doMerge', permissionHandlers.adminPostHandler, handler_doMerge);
router.get('/new', permissionHandlers.createGetHandler, handler_new);
router.get('/:locationID', handler_view);
router.get('/:locationID/edit', permissionHandlers.createGetHandler, handler_edit);
export default router;
