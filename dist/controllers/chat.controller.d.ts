import type { Request, Response } from "express";
export declare const getHealth: (_req: Request, res: Response) => void;
export declare const getUsers: (_req: Request, res: Response) => Promise<void>;
export declare const createUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getChats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createDirectChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createGroupChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateGroupChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=chat.controller.d.ts.map