import type { NextFunction, Request, Response } from 'express';
import type { OrganizationRepresentative } from '../../types/recordTypes.js';
export default function handler(request: Request<{
    organizationID: string;
}, unknown, OrganizationRepresentative>, response: Response, next: NextFunction): void;
