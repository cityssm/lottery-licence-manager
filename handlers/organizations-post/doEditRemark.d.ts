import type { Request, Response } from 'express';
import type { OrganizationRemark } from '../../types/recordTypes.js';
export default function handler(request: Request<unknown, unknown, OrganizationRemark>, response: Response): void;
