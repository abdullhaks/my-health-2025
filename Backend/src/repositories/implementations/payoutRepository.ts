import BaseRepository from "./baseRepository";
import { inject, injectable } from "inversify";
import { IPayoutDocument, payoutDocument } from "../../entities/payoutEntities";
import {Model} from "mongoose"
import { IPayouts } from "../../dto/payoutDto";

@injectable()
export default class PayoutRepository extends BaseRepository<IPayoutDocument> {
  constructor(@inject("payoutModel") private _payoutModel: Model<payoutDocument>) {
    super(_payoutModel);
  }

  async getPayouts(page: number, limit: number, query: any = {}): Promise<{payouts: IPayouts[],
        totalPages:number}> {
    try {
      const skip = (page - 1) * limit;
      const payouts = await this._payoutModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await this._payoutModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        payouts: payouts,
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching transactions:", err);
      throw new Error("Failed to fetch transactions");
    }
  }
}
