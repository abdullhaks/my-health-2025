import { IAppointment , IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IUser } from "../../../dto/userDTO";
import { DoctorResponseDTO, IDoctor, SecureDoctorResponseDTO } from "../../../dto/doctorDTO";
import { IWalletPaymentData } from "../../../entities/paymentEntities";

interface DetailAppointment extends IAppointmentDTO {
  profile?: string;
}


export default interface IUserAppointmentService {
  fetchingDoctors(
    search: string,
    location: string,
    category: string,
    sort: string,
    page: number,
    limit: number
  ): Promise<{
    doctors: SecureDoctorResponseDTO[] | undefined;
    total: number;
    page: number;
    totalPages: number;
  }>;

  getUserAppointments(
    userId: string,
    page: number,
    limit: number,
    filters: {
      appointmentStatus?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ appointments: DetailAppointment[] | null; totalPages: number }>;

  cancelAppointment(
    appointmentId: string
  ): Promise<{ status: boolean; message: string; updatedUser: Partial<IUser> }>;
  walletPayment(data: Partial<IAppointment>): Promise<IAppointmentDTO>;
  activeBooking(userId: string, doctorId: string): Promise<{ status: boolean }>;
}
