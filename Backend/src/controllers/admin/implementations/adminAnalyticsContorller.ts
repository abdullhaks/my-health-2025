import { inject, injectable } from "inversify";
import IAdminAnalyticsController from "../interfaces/IAdminAnalyticsController";
import IAdminAnalyticsServices from "../../../services/admin/interfaces/IAdminAnalyticsServices";
import { Request, Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";
import { CustomError } from "../../../utils/interfaces";

injectable();
export default class AdminAnalyticsContorller
  implements IAdminAnalyticsController
{
  constructor(
    @inject("IAdminAnalyticsServices")
    private _adminAnalyticsService: IAdminAnalyticsServices
  ) {}

  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.params.filter;
      const response = await this._adminAnalyticsService.getUserAnalytics(
        filter
      );
      res.status(HttpStatusCode.OK).json(response);
    } catch (error:any) {
      console.error("Error in getUserAnalytics controller:", error);
      let message = MESSAGES.analytics.databaseError;
      let status = HttpStatusCode.INTERNAL_SERVER_ERROR;

      switch (error.message){
        case MESSAGES.analytics.missingFilter: {
          message = MESSAGES.analytics.missingFilter
          status = HttpStatusCode.BAD_REQUEST
          break;
        }
        case MESSAGES.analytics.notFound : {
          message = MESSAGES.analytics.notFound
          break;

        }

        case MESSAGES.analytics.failedToFetch : {
          message = MESSAGES.analytics.failedToFetch
          break;
        }
      }
      
      res .status(status).json({ message:message});
    }
  }

  async getDoctorAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.params.filter;
      const response = await this._adminAnalyticsService.getDoctorAnalytics(
        filter
      );
      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.error("Error in getUserAnalytics controller:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getTotalAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const response = await this._adminAnalyticsService.getTotalAnalytics();
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async appointmentStats(req: Request, res: Response): Promise<void> {
    try {
      const { filter } = req.query;

      if (!filter) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "bad request , doctor id missed" });
        return;
      }

      const response = await this._adminAnalyticsService.appointmentStats(
        filter?.toString()
      );

      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      console.error("Error fetching appointment stats:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.server.serverError,
      });
    }
  }

  async reportsStats(req: Request, res: Response): Promise<void> {
    try {
      const { filter } = req.query;

      if (!filter) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "bad request , doctor id missed" });
        return;
      }

      const response = await this._adminAnalyticsService.reportsStats(
        filter?.toString()
      );

      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      console.error("Error fetching reports stats:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.server.serverError,
      });
    }
  }
}
