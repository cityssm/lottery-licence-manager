import type { Request, Response } from 'express';
import { type AddTransactionForm } from '../../helpers/licencesDB/addTransaction.js';
export default function handler(request: Request<unknown, unknown, AddTransactionForm>, response: Response): void;
