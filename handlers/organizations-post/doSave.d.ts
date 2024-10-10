import type { Request, Response } from 'express';
import type { Organization } from '../../types/recordTypes.js';
export default function handler(request: Request<unknown, unknown, Organization>, response: Response): void;
