import BaseRepository from "../implementations/baseRepository";
import { IPayoutDocument } from "../../entities/payoutEntities";
import { IPayouts } from "../../dto/payoutDto";
import { FilterQuery } from "mongoose";

export default interface IPayoutRepository
  extends BaseRepository<IPayoutDocument> {
  getPayouts(page: number, limit: number, query: FilterQuery<IPayoutDocument>): Promise<{payouts: IPayouts[],
          totalPages:number}>;
}
