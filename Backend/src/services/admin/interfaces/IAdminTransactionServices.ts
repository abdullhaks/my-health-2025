import { ITransactions, TransactionResponseDTO } from "../../../dto/transactionDto";

interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}

export default interface IAdminTransactionsService {
  getTransactions(
    pageNumber: number,
    limitNumber: number,
    filters: filter
  ): Promise<{
            transactions:TransactionResponseDTO[],
            totalPages:number
          }>;
}
