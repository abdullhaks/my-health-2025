import BaseRepository from "../implementations/baseRepository";
import { IReportAnalysisDocument } from "../../entities/reportAnalysisEntities";
import { PipelineStage } from "mongoose";

export default interface IReportAnalysisRepository
  extends BaseRepository<IReportAnalysisDocument> {
  aggregate<T = IReportAnalysisDocument>(
    pipeline: PipelineStage[]
  ): Promise<T[]>;
}
