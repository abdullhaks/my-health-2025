import { inject, injectable } from "inversify";
import { ITransactionDocument, transactionDocument } from "../../entities/transactionsEntities";
import ITransactionRepository from "../interfaces/ITransactionRepository";
import BaseRepository from "./baseRepository";
import {Model} from "mongoose";
import { ITransactions } from "../../dto/transactionDto";

@injectable()
export default class TransactionRepository
  extends BaseRepository<ITransactionDocument>
  implements ITransactionRepository
{
  constructor(@inject("transactionModel") private _transactionModel: Model<transactionDocument>) {
    super(_transactionModel);
  }

  async getAllTransactions(
    page: number,
    limit: number,
    query: any = {}
  ): Promise<{
        transactions:ITransactions[],
        totalPages:number
      }> {
    try {
      const skip = (page - 1) * limit;
      const transactions = await this._transactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await this._transactionModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        transactions:transactions,
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching transactions:", err);
      throw new Error("Failed to fetch transactions");
    }
  }
}
