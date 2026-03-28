import type { Request, Response } from "express";
export declare const signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const ensureAdminAccount: () => Promise<void>;
export declare const me: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changePassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const adminPage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map