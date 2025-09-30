import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IPrescription } from "../../../dto/prescriptionDto";
import { prescriptionResponseDTO } from "../../../dto/prescriptionDto";

interface IAppointmentWithPrescription extends IAppointmentDTO {
  prescriptions?: prescriptionResponseDTO;
}
export default interface IDoctorAppointmentService {
  getDoctorAppointments(
    doctorId: string,
    page: number,
    limit: number,
    filters: {
      appointmentStatus?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    appointments: IAppointmentWithPrescription[] | null;
    totalPages: number;
  }>;

  cancelAppointment(
    appointmentId: string
  ): Promise<{ status: boolean; message: string }>;
}
