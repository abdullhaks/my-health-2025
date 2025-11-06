import { Request, Response } from "express";

export default interface IDoctorAppointmentController {
  getAppointments(req: Request, res: Response): Promise<void>;
  cancelAppointment(req: Request, res: Response): Promise<void>;
}
