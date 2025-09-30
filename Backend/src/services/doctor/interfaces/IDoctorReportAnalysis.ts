import { IReportAnalysis } from "../../../dto/reportAnalysisDTO";
import { reportAnalysisResponseDTO } from "../../../dto/reportAnalysisDTO";

export default interface IDoctorReportAnalysisService {
  getReports(doctorId: string): Promise<reportAnalysisResponseDTO[]>;
  submitAnalysisReports(
    analysisId: string,
    result: string
  ): Promise<reportAnalysisResponseDTO>;
  cancelAnalysisReports(
    analysisId: string,
    userId: string,
    fee: number
  ): Promise<reportAnalysisResponseDTO>;
}
