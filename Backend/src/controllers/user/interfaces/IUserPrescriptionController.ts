import { Request, Response } from "express";

export default interface IUserPrescriptionController {
  getPrescription(req: Request, res: Response): Promise<void>;
  getLatestPrescription(req: Request, res: Response): Promise<void>;
  getLatestDoctorPrescription(req: Request, res: Response): Promise<void>;
}
