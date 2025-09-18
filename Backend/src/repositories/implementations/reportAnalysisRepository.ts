import { injectable, inject } from "inversify";
import { IReportAnalysisDocument,reportAnalysisDocument } from "../../entities/reportAnalysisEntities";
import BaseRepository from "./baseRepository";
import IReportAnalysisRepository from "../interfaces/IReportAnalysisRepository";
import {Model} from "mongoose"

@injectable()
export default class ReportAnalysisRepository
  extends BaseRepository<IReportAnalysisDocument>
  implements IReportAnalysisRepository
{
  constructor(@inject("reportAnalysisModel") private _reportModel: Model<reportAnalysisDocument>) {
    super(_reportModel);
  }
}
