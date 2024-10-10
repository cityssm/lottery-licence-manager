import type { Request, Response } from 'express';
import type { OrganizationBankRecord } from '../../types/recordTypes.js';
export default function handler(request: Request<unknown, unknown, OrganizationBankRecord>, response: Response): void;
