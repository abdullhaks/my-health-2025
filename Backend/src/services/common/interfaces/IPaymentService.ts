import { IDoctor } from "../../../dto/doctorDTO";

export default interface IPaymentService {
  handleWebhookEvent(event: any): Promise<{ received: boolean }>;
  progressingPayment(doctorId:string,userId:string,slotId:string):Promise<{paymenStatus:string}>
}
