import { Response, Request } from "express";
import IAdminAppointmentController from "../interfaces/IAdminAppointmentController";
import { inject, injectable } from "inversify";
import IAdminAppointmentService from "../../../services/admin/interfaces/IAdminAppointmentServices";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

injectable();

export default class AdminAppointmentController
  implements IAdminAppointmentController
{
  constructor(
    @inject("IAdminAppointmentsService")
    private _adminAppointmentService: IAdminAppointmentService
  ) {}

  /**
   * Handles fetching admin appintments based on date, filters with pagination.
   * @async
   * @function getAppointments
   * @param {import('express').Request} req - Express request object containing `params.filter`.
   * @param {import('express').Response} res - Express response object used to send results.
   * @returns {Promise<void>} Sends a JSON response with appointment data or an error message.
   * @description
   * This controller:
   *  - Extracts the `filter` , `page` and `limit`  parameter from the request.
   *  - Calls the appointment service to retrieve user appointments.
   *  - Handles different error types (missing filter, not found, database errors, etc.).
   * @example
   * // GET /api/admin/appointments/:filter
   * // Example: /api/admin/appointments/month
   * router.get('/appointments/:filter', _adminAppointmentService.getAppointments);
   */

  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status, doctorCategory, startDate, endDate } =
        req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        status: status as string,
        doctorCategory: doctorCategory as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const appointments = await this._adminAppointmentService.getAppointments(
        pageNumber,
        limitNumber,
        filters
      );

      res.status(HttpStatusCode.OK).json(appointments);
    } catch (err) {
      console.error("Error in fetching user appointments:", err);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
