import { ISession, sessionResponseDTO } from "../../../dto/sessionDTO";
import { IAppointment } from "../../../dto/appointmentDTO";
import { IAppointmentDTO } from "../../../dto/appointmentDTO";

export default interface IUserSessionService {
  getSessions(doctorId: string): Promise<sessionResponseDTO[]>;
  getBookedSlots(
    doctorId: string,
    formattedDate: string
  ): Promise<IAppointmentDTO[]>;
  getUnavailableDays(doctorId: string): Promise<String[]>;
  getUnavailablSessions(
    doctorId: string
  ): Promise<{ day: String; sessionId: string }[]>;
}
