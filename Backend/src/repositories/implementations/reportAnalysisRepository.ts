import { injectable, inject } from "inversify";
import {
  IReportAnalysisDocument,
  reportAnalysisDocument,
} from "../../entities/reportAnalysisEntities";
import BaseRepository from "./baseRepository";
import IReportAnalysisRepository from "../interfaces/IReportAnalysisRepository";
import { Model, PipelineStage } from "mongoose";

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

  async aggregate<T = any>(pipeline: PipelineStage[]): Promise<T[]> {
    try {
      const resp = await this._reportModel.aggregate(pipeline);
      console.log("pipeline is .....", pipeline);
      console.log("resp is .....", resp);
      return resp;
    } catch (error) {
      console.error("Error in aggregate:", error);
      throw new Error("Failed to perform aggregation");
    }
  }
}
