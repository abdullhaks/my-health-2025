import { Response, Request } from "express";
import IUserAppointmentController from "../interfaces/IUserAppointmentController";
import { inject, injectable } from "inversify";
import IUserAppointmentService from "../../../services/user/interfaces/IUserAppointmentServices";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";
import { HttpException } from "../../../utils/http.exception";

interface AppointmentFilter {
  appointmentStatus?: string;
  startDate?: string;
  endDate?: string;
}

injectable();

export default class UserAppointmentController implements IUserAppointmentController {
  constructor(
    @inject("IUserAppointmentService")
    private _appointmentService: IUserAppointmentService
  ) {}

  async fetchingDoctors(req: Request, res: Response): Promise<void> {
    try {
      const {
        search = "",
        location = "",
        category = "",
        sort = "",
        page = "1",
        limit = "10",
      } = req.query;

      const doctors = await this._appointmentService.fetchingDoctors(
        String(search),
        String(location),
        String(category),
        String(sort),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(HttpStatusCode.OK).json(doctors);
    } catch (err) {
      console.error("Error in controller fetchingDoctors:", err);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { userId, page = "1", limit = "10", filter } = req.query;

      // Parse and validate filter
      let parsedFilter: AppointmentFilter = {};
      if (typeof filter === "string") {
        try {
          const filterObj = JSON.parse(filter);
          parsedFilter = {
            appointmentStatus:
              typeof filterObj.appointmentStatus === "string"
                ? filterObj.appointmentStatus
                : undefined,
            startDate:
              typeof filterObj.startDate === "string"
                ? filterObj.startDate
                : undefined,
            endDate:
              typeof filterObj.endDate === "string"
                ? filterObj.endDate
                : undefined,
          };
        } catch (err) {
          console.error("Error parsing filter:", err);
          res
            .status(HttpStatusCode.BAD_REQUEST)
            .json({ message: "Invalid filter format" });
          return;
        }
      } else if (
        typeof filter === "object" &&
        filter !== null &&
        !Array.isArray(filter)
      ) {
        // If filter is already an object (unlikely with query params, but handling for completeness)
        parsedFilter = {
          appointmentStatus:
            typeof filter.appointmentStatus === "string"
              ? filter.appointmentStatus
              : undefined,
          startDate:
            typeof filter.startDate === "string" ? filter.startDate : undefined,
          endDate:
            typeof filter.endDate === "string" ? filter.endDate : undefined,
        };
      }

      const response = await this._appointmentService.getUserAppointments(
        String(userId),
        Number(page),
        Number(limit),
        parsedFilter
      );

      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      console.error("Error in fetchin user appointments:", err);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {

      const appoinmentId = req.query.appointmentId;

      const response = await this._appointmentService.cancelAppointment(
        String(appoinmentId)
      );

      res.status(HttpStatusCode.OK).json(response);
    } catch (error: unknown) {
    
    
        if (error instanceof HttpException) {
    
          res.status(error.status).json({ message: error.message, code: error.code });
          return;
        }
    
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
           .json({ message: MESSAGES.server.serverError });
      }
  }

  async walletPayment(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const response = await this._appointmentService.walletPayment(data);

      res.status(HttpStatusCode.CREATED).json({ appointment: response });
    } catch (err) {
      console.error("Error in wallet payment:", err);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async activeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { userId, doctorId } = req.query;
      const response = await this._appointmentService.activeBooking(
        String(userId),
        String(doctorId)
      );
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      console.error("Error in active booking:", err);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
