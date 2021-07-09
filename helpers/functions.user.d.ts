import type { Request } from "express";
export declare const userIsAdmin: (request: Request) => boolean;
export declare const userCanUpdate: (request: Request) => boolean;
export declare const userCanCreate: (request: Request) => boolean;
export declare const getHashString: (userName: string, passwordPlain: string) => string;
