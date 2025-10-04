import { IPayouts } from "../../../dto/payoutDto";
import { payoutResponseDTO } from "../../../dto/payoutDto";
import { payoutUpdateData } from "../../../entities/payoutEntities";


interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}
export default interface IAdminPayoutService {
  getPayouts(
    pageNumber: number,
    limitNumber: number,
    filters: filter
  ): Promise<{payouts: payoutResponseDTO[], totalPages:number}>;
  updatePayout(id: string, data: payoutUpdateData): Promise<payoutResponseDTO>;
}
