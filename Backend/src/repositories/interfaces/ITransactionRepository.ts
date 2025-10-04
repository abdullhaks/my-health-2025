import BaseRepository from "../implementations/baseRepository";
import { ITransactionDocument } from "../../entities/transactionsEntities";
import { ITransactions } from "../../dto/transactionDto";
import { FilterQuery } from "mongoose";

export default interface ITransactionRepository
  extends BaseRepository<ITransactionDocument> {
  getAllTransactions(page: number, limit: number, query: FilterQuery<ITransactionDocument>): Promise<{
          transactions:ITransactions[],
          totalPages:number
        }>;
}
