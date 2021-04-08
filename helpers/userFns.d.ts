import type { Request } from "express";
export declare const userIsAdmin: (req: Request) => boolean;
export declare const userCanUpdate: (req: Request) => boolean;
export declare const userCanCreate: (req: Request) => boolean;
export declare const getHashString: (userName: string, passwordPlain: string) => string;
