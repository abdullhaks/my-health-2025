import { IPayouts } from "../../../dto/payoutDto";
import { payoutResponseDTO } from "../../../dto/payoutDto";


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
  updatePayout(id: string, data: any): Promise<payoutResponseDTO>;
}
