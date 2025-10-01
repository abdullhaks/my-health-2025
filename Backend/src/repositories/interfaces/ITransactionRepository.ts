import BaseRepository from "../implementations/baseRepository";
import { ITransactionDocument } from "../../entities/transactionsEntities";
import { ITransactions } from "../../dto/transactionDto";

export default interface ITransactionRepository
  extends BaseRepository<ITransactionDocument> {
  getAllTransactions(page: number, limit: number, query: any): Promise<{
          transactions:ITransactions[],
          totalPages:number
        }>;
}
