import {IReportAnalysis, reportAnalysisResponseDTO } from "../dto/reportAnalysisDTO";

export class ReportAnalysisMapper {
  static async toReportAnalysisResponseDTO(
    r: IReportAnalysis  
    ): Promise<reportAnalysisResponseDTO> {

        return {
            _id: r._id.toString(),
            doctorId: r.doctorId.toString(),
            userId: r.userId.toString(),
            concerns: r.concerns,
            files: r.files,
            doctorName: r.doctorName.toString(),
            doctorCategory: r.doctorCategory,
            createdAt: r.createdAt,
            fee: r.fee,
            analysisStatus: r.analysisStatus,
            result: r.result,

        }

    }

}

