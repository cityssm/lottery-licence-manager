import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes.js';
export default function getOrganization(organizationID: number, requestSession: expressSession.Session): llm.Organization | undefined;
