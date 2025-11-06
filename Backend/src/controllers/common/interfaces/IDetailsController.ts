import { Request, Response } from "express";

export default interface IDetailsController {
  getDoctor(req: Request, res: Response): Promise<void>;
  getUser(req: Request, res: Response): Promise<void>;
}
