import { IReportAnalysis, reportAnalysisResponseDTO } from "../../../dto/reportAnalysisDTO";
import { IUser } from "../../../dto/userDTO";

export default interface IUserReportAnalysisService {
  getReports(userId: string,page:number,limit:number): Promise<{ reports: reportAnalysisResponseDTO[]; totalPages: number }>;
  cancelAnalysisReports(
    analysisId: string,
    userId: string,
    fee: number
  ): Promise<{
    userWithoutPassword: Partial<IUser>;
    response: IReportAnalysis;
  }>;
}
