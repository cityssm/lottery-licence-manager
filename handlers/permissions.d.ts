import type { NextFunction, Request, Response } from 'express';
export declare function forbiddenJSON(response: Response): Response;
export declare function adminGetHandler(request: Request, response: Response, next: NextFunction): void;
export declare function adminPostHandler(request: Request, response: Response, next: NextFunction): void;
export declare function updateGetHandler(request: Request, response: Response, next: NextFunction): void;
export declare function updatePostHandler(request: Request, response: Response, next: NextFunction): void;
export declare function createGetHandler(request: Request, response: Response, next: NextFunction): void;
export declare function createPostHandler(request: Request, response: Response, next: NextFunction): void;
