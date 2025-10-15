import { ISession, ISessionDocument, sessionResponseDTO } from "../../../dto/sessionDTO";
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IUnAvailableDayDocument } from "../../../entities/unAvailableDayEntities";
import { IUnAvailableSessionDocument } from "../../../entities/unAvailableSessionEntities";

interface cancelledSessions {
  appointmentId: string;
  userId: string;
  doctorName: string;
  date: string;
  start: Date;
  end: Date;
}

export default interface IDoctorSessionService {
  addSession(sessionData: ISession): Promise<sessionResponseDTO>;
  getSessions(doctorId: string): Promise<sessionResponseDTO[]>;
  getBookedSlots(doctorId: string, formattedDate: string): Promise<string[]>;
  deleteSession(sessionId: string): Promise<Partial<IAppointmentDTO>[] | null>;
  updateSession(
    sessionId: string,
    editingSession: Partial<ISession>
  ): Promise<{
    updatedSession: sessionResponseDTO | null;
    cancelledAppoitments: cancelledSessions[] | null;
  }>;
  makeDayUnavailable(
    doctorId: string,
    day:  string
  ): Promise<{
    unavailableDay: IUnAvailableDayDocument | null;
    cancelledAppoitments: cancelledSessions[] | [];
  }>;
  makeDayAvailable(
    doctorId: string,
    day:  string
  ): Promise<IUnAvailableDayDocument | null>;
  getUnavailableDays(doctorId: string): Promise<String[] | null>;
  unAvailableSessions(
    doctorId: string,
    day:  string,
    sessionId: string
  ): Promise<{
    unAvailableSessions: IUnAvailableSessionDocument | null;
    cancelledAppoitments: cancelledSessions[] | null;
  }>;
  makeSessionsAvailable(
    doctorId: string,
    day: string,
    sessionId: string
  ): Promise<IUnAvailableSessionDocument | null>;
  getUnavailablSessions(
    doctorId: string
  ): Promise<{ day: String; sessionId: string }[] | [] | null>;
}
