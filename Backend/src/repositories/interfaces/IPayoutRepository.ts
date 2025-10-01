import BaseRepository from "../implementations/baseRepository";
import { IPayoutDocument } from "../../entities/payoutEntities";
import { IPayouts } from "../../dto/payoutDto";

export default interface IPayoutRepository
  extends BaseRepository<IPayoutDocument> {
  getPayouts(page: number, limit: number, query: any): Promise<{payouts: IPayouts[],
          totalPages:number}>;
}
