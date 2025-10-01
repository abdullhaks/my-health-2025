import { IpayoutDetails } from "../../../entities/paymentEntities";
import { IPayoutDocument } from "../../../entities/payoutEntities";
import { userDocumentWithoutPassword } from "../../../entities/userEntities";
import { DoctorResponseDTO } from "../../../dto/doctorDTO";
import { payoutResponseDTO } from "../../../dto/payoutDto";

interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}
export default interface IDoctorPayoutService {
  requestPayout(payoutDetails: IpayoutDetails, doctorId: string): Promise<{
        message: string;
        updatedDoctor: DoctorResponseDTO,
      }>;
  getPayouts(
    doctorId: string,
    pageNumber: number,
    limitNumber: number,
    filters: filter
  ): Promise<{payouts: payoutResponseDTO[], totalPages:number}>;
}
