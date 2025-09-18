import { Request, Response } from "express";
import IDoctorReportAnalysisCtrl from "../interfaces/IDoctorReportAnalysisCtrl";
import { inject, injectable } from "inversify";
import IDoctorReportAnalysisService from "../../../services/doctor/interfaces/IDoctorReportAnalysis";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

@injectable()
export default class DoctorReportAnalyisController
  implements IDoctorReportAnalysisCtrl
{
  constructor(
    @inject("IDoctorReportAnalysisService")
    private _doctorReportAnalyisService: IDoctorReportAnalysisService
  ) {}

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.query.doctorId;
      if (doctorId) {
        const response = await this._doctorReportAnalyisService.getReports(
          doctorId.toString()
        );
        res.status(HttpStatusCode.OK).json(response);
        return;
      }
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "bad request" });
      return;
    } catch (error) {
      console.log("error in get analysis Reports", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
      return;
    }
  }

  async submitAnalysisReports(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId, result } = req.body;
      if (!analysisId || !result) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "bad request" });
        return;
      }
      const response =
        await this._doctorReportAnalyisService.submitAnalysisReports(
          analysisId,
          result
        );

      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log("error in submit analysis Reports", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async cancelAnalysisReports(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId, userId, fee } = req.body;
      if (!analysisId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "bad request" });
        return;
      }
      const response =
        await this._doctorReportAnalyisService.cancelAnalysisReports(
          analysisId,
          userId,
          fee
        );
      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log("error in cancel analysis Reports", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
