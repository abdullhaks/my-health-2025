import { inject, injectable } from "inversify";
import IAdminPayoutService from "../interfaces/IAdminPayoutService";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import IPayoutRepository from "../../../repositories/interfaces/IPayoutRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { IPayouts } from "../../../dto/payoutDto";
import { payoutResponseDTO } from "../../../dto/payoutDto";
import { PayoutMapper } from "../../../mappers/payout.mapper";
import { FilterQuery } from "mongoose";
import { IPayoutDocument, payoutUpdateData } from "../../../entities/payoutEntities";

interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export default class AdminPayoutService implements IAdminPayoutService {
  constructor(
    @inject("ITransactionRepository")
    private _transactionRepository: ITransactionRepository,
    @inject("IPayoutRepository") private _payoutRepository: IPayoutRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository
  ) {}

  async getPayouts(
    pageNumber: number,
    limitNumber: number,
    filters: filter = {}
  ): Promise<{payouts: payoutResponseDTO[], totalPages:number}> {
    const query: FilterQuery<IPayoutDocument> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    const transactions = await this._payoutRepository.getPayouts(
      pageNumber,
      limitNumber,
      query
    );

   const payoutDto =await Promise.all(
    transactions.payouts.map(async(item:IPayouts)=>{
      return await PayoutMapper.toPayoutResponseDTO(item)
    })
   )

    return {payouts:payoutDto,totalPages:transactions.totalPages};
  }

  async updatePayout(id: string, data: payoutUpdateData): Promise<payoutResponseDTO> {
    const resp = await this._payoutRepository.update(id, data);

    if (!resp?.doctorId) {
      throw new Error("doctorId is undefined");
    }
    const updateWalet = await this._doctorRepository.update(resp.doctorId, {
      $inc: { walletBalance: resp?.totalAmount },
    });


    const payoutdto = await PayoutMapper.toPayoutResponseDTO(resp);

    return payoutdto;
  }
}
