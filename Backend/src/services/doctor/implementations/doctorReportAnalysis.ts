import { inject, injectable } from "inversify";
import IDoctorReportAnalysisService from "../interfaces/IDoctorReportAnalysis";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IReportAnalysis, reportAnalysisResponseDTO } from "../../../dto/reportAnalysisDTO";
import { ReportAnalysisMapper } from "../../../mappers/reportAnalysis.mapper";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";

@injectable()
export default class DoctorReportAnalysisService
  implements IDoctorReportAnalysisService
{
  constructor(
    @inject("IReportAnalysisRepository")
    private _ReportAnalysisRepository: IReportAnalysisRepository,
    @inject("IUserRepository") private _UserRepository: IUserRepository
  ) {}

  async getReports(doctorId: string,pageNumber: number,limitNumber: number):
   Promise<{ reports: reportAnalysisResponseDTO[]; totalPages: number }> {
    try {
      const response = await this._ReportAnalysisRepository.getReports(
      doctorId,
      pageNumber,
      limitNumber
    );

       const reportDto = await Promise.all(
        response.reports.map(async (item) => {
          const dto = await ReportAnalysisMapper.toReportAnalysisResponseDTO(item);

 

          const signedFiles = await Promise.all(
            dto.files.map(async (file) => {
              try {
                return await getSignedImageURL(file);
              } catch (error) {
                console.error(`Error generating signed URL for file ${file}:`, error);
                return file; 
              }
            })
          );


          
          return { ...dto, files: signedFiles };
        })
      );
      

      const resp = {reports:reportDto,totalPages:response.totalPages}
  
      return resp;

    } catch (error) {
      console.error("Error in get sessions", error);
      throw new Error("Failed to get consultation sessions");
    }
  }

  async submitAnalysisReports(
    analysisId: string,
    result: string
  ): Promise<reportAnalysisResponseDTO> {
    try {
      const response = await this._ReportAnalysisRepository.update(analysisId, {
        result: result,
        analysisStatus: "submited",
      });

      if (!response) {
        throw new Error("submiting report analysis failed");
      };

      const reportAnalysisDto = await ReportAnalysisMapper.toReportAnalysisResponseDTO(response);
      return reportAnalysisDto;

    } catch (error) {
      console.error("Error in submitting analysis reports", error);
      throw new Error("Failed to submit analysis report");
    }
  }

  async cancelAnalysisReports(
    analysisId: string,
    userId: string,
    fee: number
  ): Promise<reportAnalysisResponseDTO> {
    try {
      if (!analysisId || !userId || fee <= 0) {
        throw new Error("Invalid parameters for cancelling analysis report");
      }

   
      const walletUpdate = await this._UserRepository.update(userId, {
        $inc: { walletBalance: fee },
      });

      if (walletUpdate) {
        const response = await this._ReportAnalysisRepository.update(
          analysisId,
          { analysisStatus: "cancelled" }
        );

        if (!response) {
          throw new Error("wallet updation failed");
        }

        const reportAnalysisDto = await ReportAnalysisMapper.toReportAnalysisResponseDTO(response);
        return reportAnalysisDto;
        
      } else {
        console.error("Failed to update wallet balance");
        throw new Error("Failed to update wallet balance");
      }
    } catch (error) {
      console.error("Error in cancelling analysis reports", error);
      throw new Error("Failed to cancel analysis report");
    }
  }
}
