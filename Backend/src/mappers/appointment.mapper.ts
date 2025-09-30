import { IAppointmentDTO,IAppointment } from "../dto/appointmentDTO";

export class AppointmentMapper {
    static async toResponseDTO(appointment: IAppointment): Promise<IAppointmentDTO> {
        return {
                _id: appointment._id.toString(),
                userId: appointment.userId,
                doctorId: appointment.doctorId,
                slotId: appointment.slotId,
                sessionId: appointment.sessionId,
                date: appointment.date,
                start: appointment.start,
                end: appointment.end,
                duration: appointment.duration,
                fee: appointment.fee,
                appointmentStatus: appointment.appointmentStatus,
                transactionId: appointment.transactionId,
                userName: appointment.userName,
                userEmail: appointment.userEmail,
                doctorName: appointment.doctorName,
                doctorSpecialization: appointment.doctorSpecialization,
                paymentType: appointment.paymentType,
                paymentStatus: appointment.paymentStatus,
                doctorCategory: appointment.doctorCategory,
                callStartTime: appointment.callStartTime,
                callEndTime: appointment.callEndTime,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,


        }

    }
}