import type { Request, Response } from "express";
export declare const getAdminDashboard: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdminUsers: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createAdminUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdminUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAdminUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdminChats: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createAdminChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdminChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAdminChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdminMessages: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createAdminMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdminMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAdminMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=admin.controller.d.ts.map