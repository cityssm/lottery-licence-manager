import type { Request } from 'express';
export declare function userIsAdmin(request: Partial<Request>): boolean;
export declare function userCanUpdate(request: Partial<Request>): boolean;
export declare function userCanCreate(request: Partial<Request>): boolean;
export declare function getHashString(userName: string, passwordPlain: string): string;
