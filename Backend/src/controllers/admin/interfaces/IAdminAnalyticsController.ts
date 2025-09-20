import { Request, Response } from "express";

export default interface IAdminAnalyticsController {
  getUserAnalytics(req: Request, res: Response): Promise<void>;
  getDoctorAnalytics(req: Request, res: Response): Promise<void>;
  getTotalAnalytics(req: Request, res: Response): Promise<void>;
  appointmentStats(req: Request, res: Response): Promise<void>;
  reportsStats(req: Request, res: Response): Promise<void>;
}
