import IPrescriptionDocument from "../../../entities/prescriptionEntities";
import { prescriptionResponseDTO } from "../../../dto/prescriptionDto";


interface medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | undefined;
}
interface prescriptionReq{
  _id?: string;
  appointmentId: string;
  userId: string;
  doctorId: string;
  medicalCondition: string;
  medications: medication[];
  medicationPeriod: number;
  notes?: string;
  createdAt?: Date;
}
export default interface IDoctorPrescriptionService {
  getPrescriptions(userId: string): Promise<prescriptionResponseDTO[]>;
  submitPrescription(prescriptionData: prescriptionReq): Promise<prescriptionResponseDTO>;
}
