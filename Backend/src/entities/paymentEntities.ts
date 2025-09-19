export interface IMetaData {

  doctorName?: string;
  doctorCategory?: string;
  userId?: string;
  concerns?: string;
  file1?: string;
  file2?: string;
  file3?: string;
  file4?: string;
  file5?: string;
  fee?: number;
  slotId?: string;
  sessionId?: string;
  start?: string | Date;
  end?: string | Date;
  duration?: number;
  doctorId?: string;
  type?: string;
  role?: string;
}



export interface IWalletPaymentData{
        doctorId:string;
        userId: string;
        userName: string;
        userEmail:string;
        date: string;
        slotId: string;
        sessionId: string;
        start: Date | string;
        end: Date | string;
        paymentType:string;
        duration: number;
        fee: number;
        paymentStatus: string;
        appointmentStatus: string;
        doctorName: string;
        doctorCategory :string;
        transactionId:string;

}


export interface IpayoutDetails {
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
}