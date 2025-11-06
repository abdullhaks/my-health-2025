import { NextFunction, Request, Response } from "express";

export default interface IAdminUserController {
  getUsers(req: Request, res: Response): Promise<void>;
  block(req: Request, res: Response): Promise<void>;
  unblock(req: Request, res: Response): Promise<void>;
}
