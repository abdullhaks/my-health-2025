import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IUser } from "../../../dto/userDTO";
import { IDoctor } from "../../../dto/doctorDTO";
import { IWalletPaymentData } from "../../../entities/paymentEntities";

export default interface IUserAppointmentService {
  fetchingDoctors(
    search: string,
    location: string,
    category: string,
    sort: string,
    page: number,
    limit: number
  ): Promise<{
    doctors: IDoctor[] | null;
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
  ): Promise<{ appointments: IAppointmentDTO[] | null; totalPages: number }>;

  cancelAppointment(
    appointmentId: string
  ): Promise<{ status: boolean; message: string; updatedUser: Partial<IUser> }>;
  walletPayment(data: Partial<IAppointment>): Promise<IAppointment>;
  activeBooking(userId: string, doctorId: string): Promise<{ status: boolean }>;
}
