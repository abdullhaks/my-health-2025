import { inject, injectable } from "inversify";
import IUserTransactionsService from "../interfaces/IUserTransactionServices";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import { ITransactions, TransactionResponseDTO } from "../../../dto/transactionDto";
import { FilterQuery } from "mongoose";
import { TransactionMapper } from "../../../mappers/transaction.mapper";

interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export default class UserTransactionsService
  implements IUserTransactionsService
{
  constructor(
    @inject("ITransactionRepository")
    private _transactionRepository: ITransactionRepository
  ) {}

  async getTransactions(
    userId: string,
    pageNumber: number,
    limitNumber: number,
    filters: filter = {}
  ): Promise<{
            transactions:TransactionResponseDTO[],
            totalPages:number
          }> {
    const query: FilterQuery<ITransactions> = { userId: userId };

    if (filters.method) {
      query.method = filters.method;
    }
    if (filters.paymentFor) {
      query.paymentFor = filters.paymentFor;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    const transactions = await this._transactionRepository.getAllTransactions(
      pageNumber,
      limitNumber,
      query
    );
    console.log("transactions from service...", transactions);

    const transactionsDTOs: TransactionResponseDTO[] = [];
    for (const t of transactions.transactions) {
      const dto = await TransactionMapper.toTransactionResponseDTO(t);
      transactionsDTOs.push(dto);
    }

    return {transactions:transactionsDTOs,totalPages:transactions.totalPages};
  }
}
