import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IPrescription } from "../../../dto/prescriptionDto";

interface IAppointmentWithPrescription extends IAppointment {
  prescriptions?: IPrescription;
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
