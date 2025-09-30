import { IPayouts, payoutResponseDTO } from "../dto/payoutDto";


export class PayoutMapper {
    static async toPayoutResponseDTO(p: IPayouts): Promise<payoutResponseDTO> {
        return {    


            _id: p._id.toString(),
            doctorId: p.doctorId,
            bankAccNo: p.bankAccNo,
            bankAccHolderName: p.bankAccHolderName,
            bankIfscCode: p.bankIfscCode,
            totalAmount: p.totalAmount,
            paid: p.paid,
            serviceAmount: p.serviceAmount,
            status: p.status,
            on: p.on,
            transactionId: p.transactionId,
            invoiceLink: p.invoiceLink,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }
    }
}