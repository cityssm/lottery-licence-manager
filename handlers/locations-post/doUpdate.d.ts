import type { Request, Response } from 'express';
import type { Location } from '../../types/recordTypes.js';
export default function handler(request: Request<unknown, unknown, Location>, response: Response): void;
