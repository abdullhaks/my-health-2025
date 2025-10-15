import { inject, injectable } from "inversify";
import IUserReportAnalysisService from "../interfaces/IUserReportAnalysis";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import { IReportAnalysis, reportAnalysisResponseDTO } from "../../../dto/reportAnalysisDTO";
import { IUser } from "../../../dto/userDTO";
import { ReportAnalysisMapper } from "../../../mappers/reportAnalysis.mapper";

@injectable()
export default class UserReportAnalysisService
  implements IUserReportAnalysisService
{
  constructor(
    @inject("IReportAnalysisRepository")
    private _ReportAnalysisRepository: IReportAnalysisRepository,
    @inject("IUserRepository") private _UserRepository: IUserRepository
  ) {}

  async getReports(userId: string,page:number,limit:number): Promise<{ reports: reportAnalysisResponseDTO[]; totalPages: number }> {
    try {
      const response = await this._ReportAnalysisRepository.getUserReports(
        userId,
        page,
        limit
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

  async cancelAnalysisReports(
    analysisId: string,
    userId: string,
    fee: number
  ): Promise<{
    userWithoutPassword: Partial<IUser>;
    response: IReportAnalysis;
  }> {
    try {
      if (!analysisId || !userId || fee <= 0) {
        throw new Error("Invalid parameters for cancelling analysis report");
      }

   
      var walletUpdate = await this._UserRepository.update(userId, {
        $inc: { walletBalance: fee },
      });

      if (walletUpdate) {
        const { password, ...userWithoutPassword } = walletUpdate.toObject();
        if (userWithoutPassword.profile) {
          userWithoutPassword.profile = await getSignedImageURL(
            userWithoutPassword.profile
          );
        }
        const response = await this._ReportAnalysisRepository.update(
          analysisId,
          { analysisStatus: "cancelled" }
        );
        if (!response) {
          throw new Error("Failed to update analysis report status");
        }
        return { userWithoutPassword, response };
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
