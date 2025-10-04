import { injectable, inject } from "inversify";
import {
  IReportAnalysisDocument,
  reportAnalysisDocument,
} from "../../entities/reportAnalysisEntities";
import BaseRepository from "./baseRepository";
import IReportAnalysisRepository from "../interfaces/IReportAnalysisRepository";
import { FilterQuery, Model, PipelineStage } from "mongoose";

@injectable()
export default class ReportAnalysisRepository
  extends BaseRepository<IReportAnalysisDocument>
  implements IReportAnalysisRepository
{
  constructor(
    @inject("reportAnalysisModel")
    private _reportModel: Model<reportAnalysisDocument>
  ) {
    super(_reportModel);
  }

  async aggregate<T>(pipeline: PipelineStage[]): Promise<T[]> {
    try {
      const resp = await this._reportModel.aggregate(pipeline);
      console.log("pipeline is .....", pipeline);
      console.log("resp is .....", resp);
      return resp;
    } catch (error) {
      console.error("Error in aggregate:", error);
      throw new Error("Failed to perform aggregation");
    }
  };


    async getReports(
      doctorId: string,
      pageNumber: number,
      limitNumber: number
    ): Promise<{ reports: IReportAnalysisDocument[]; totalPages: number }> {
      try {
        const query: FilterQuery<IReportAnalysisDocument> = { doctorId: doctorId };
  
        const skip = (pageNumber - 1) * limitNumber;
  
        const reports = await this._reportModel
          .find(query)
          .skip(skip)
          .limit(limitNumber);

  
        const total = await this._reportModel.countDocuments(query);
        return {

          reports,
          totalPages: Math.ceil(total / limitNumber),
        };
      } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch reports");
      }
    };



      async getUserReports(
      userId: string,
      pageNumber: number,
      limitNumber: number
    ): Promise<{ reports: IReportAnalysisDocument[]; totalPages: number }> {
      try {
        const query: FilterQuery<IReportAnalysisDocument> = { userId: userId };
  
        const skip = (pageNumber - 1) * limitNumber;
  
        const reports = await this._reportModel
          .find(query)
          .skip(skip)
          .limit(limitNumber);

  
        const total = await this._reportModel.countDocuments(query);
        return {

          reports,
          totalPages: Math.ceil(total / limitNumber),
        };
      } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch reports");
      }
    }
}
