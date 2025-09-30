import { ITransactions } from "../dto/transactionDto";
import { TransactionResponseDTO } from "../dto/transactionDto";

export class TransactionMapper {
    static async toTransactionResponseDTO(t: ITransactions): Promise<TransactionResponseDTO> {
        return {
            _id: t._id.toString(),
            date: t.date,
            from: t.from,
            to: t.to,
            method: t.method,
            amount: t.amount,
            paymentFor: t.paymentFor,
            transactionId: t?.transactionId,
            appointmentId: t?.appointmentId,
            analysisId: t?.analysisId,
            invoice: t?.invoice,
            userId: t?.userId,
            doctorId: t?.doctorId,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,

        }
    }

}