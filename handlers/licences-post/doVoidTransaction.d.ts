import type { Request, Response } from 'express';
export interface DoVoidTransactionRequest {
    licenceID: string;
    transactionIndex: string;
}
export interface DoVoidTransactionResponse {
    success: boolean;
    message: string;
}
export default function handler(request: Request<unknown, unknown, DoVoidTransactionRequest>, response: Response<DoVoidTransactionResponse>): void;
