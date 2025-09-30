import { IPrescription } from "../../../dto/prescriptionDto";
import { prescriptionResponseDTO } from "../../../dto/prescriptionDto";


interface prescriptionReponseDto {
  prescription: prescriptionResponseDTO;
  user: {
    fullName?: string;
    dob?: string;
  };
  doctor: {
    fullName?: string;
    graduation?: string;
    category?: string;
    registerNo?: string;
  };
}

export default interface IUserPrescriptionService {
  getPrescription(appointmentId: string): Promise<prescriptionReponseDto>;
  getLatestPrescription(userId: string): Promise<prescriptionResponseDTO | null>;
  getLatestDoctorPrescription(
    userId: string,
    doctorId: string
  ): Promise<prescriptionResponseDTO | null>;
}
