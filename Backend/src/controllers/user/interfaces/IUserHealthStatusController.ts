import { Request, Response } from "express";

export default interface IUserHealthStatusController {
  checkHealthStatus(req: Request, res: Response): Promise<void>;
}
