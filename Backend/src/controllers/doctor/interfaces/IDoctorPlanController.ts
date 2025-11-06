import { Request, Response } from "express";

export default interface IDoctorPlanController {
  getProducts(req: Request, res: Response): Promise<void>;
}
