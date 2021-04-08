import type { RequestHandler, Response } from "express";
export declare const forbiddenJSON: (res: Response) => Response<any, Record<string, any>>;
export declare const adminGetHandler: RequestHandler;
export declare const adminPostHandler: RequestHandler;
export declare const updateGetHandler: RequestHandler;
export declare const updatePostHandler: RequestHandler;
export declare const createGetHandler: RequestHandler;
export declare const createPostHandler: RequestHandler;
