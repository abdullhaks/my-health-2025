import { inject, injectable } from "inversify";
import IDoctorAppointmentService from "../interfaces/IDoctorAppointmentService";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IPrescription } from "../../../dto/prescriptionDto";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import IPrescriptionRepository from "../../../repositories/interfaces/IPrescriptionRepositiory";
import { prescriptionResponseDTO } from "../../../dto/prescriptionDto";
import { PrescriptionMapper } from "../../../mappers/prescription.mapper";
import { AppointmentMapper } from "../../../mappers/appointment.mapper";
import { FilterQuery } from "mongoose";
import { IAppointmentDocument } from "../../../entities/appointmentEntities";

interface IAppointmentWithPrescription extends IAppointmentDTO {
  prescriptions?: prescriptionResponseDTO;
}

@injectable()
export default class DoctorAppointmentService
  implements IDoctorAppointmentService
{
  constructor(
    @inject("IAppointmentsRepository")
    private _appointmentsRepository: IAppointmentsRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IAnalyticsRepository")
    private _analyticsRepository: IAnalyticsRepository,
    @inject("ITransactionRepository")
    private _transactionRepository: ITransactionRepository,
    @inject("IPrescriptionRepository")
    private _prescriptionRepository: IPrescriptionRepository
  ) {}

  async getDoctorAppointments(
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
  }> {
    console.log("Doctor ID from service...", doctorId);

    const query: FilterQuery<IAppointmentDocument> = { doctorId };
    if (filters.appointmentStatus) {
      query.appointmentStatus = filters.appointmentStatus;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    const expiredAppointments = await this._appointmentsRepository.findAll({
      doctorId: doctorId,
      appointmentStatus: "booked",
      end: { $lt: new Date() },
    });

    // Then, update their status
    if (expiredAppointments && expiredAppointments.length > 0) {
      await this._appointmentsRepository.updateMany(
        {
          doctorId: doctorId,
          appointmentStatus: "booked",
          end: { $lt: new Date() },
        },
        { appointmentStatus: "cancelled", paymentStatus: "refunded" }
      );

      await Promise.all(
        expiredAppointments.map(async (appointment: IAppointmentDocument) => {
          await this._userRepository.update(appointment.userId, {
            $inc: { walletBalance: appointment.fee },
          });
          // Optionally update analytics here if needed
          await this._transactionRepository.create({
            from: "admin",
            to: "user",
            method: "wallet",
            amount: appointment.fee,
            paymentFor: "refund",
            userId: appointment.userId,
            doctorId: appointment.doctorId,
          });
        })
      );
    }

    let { appointments, totalPages } =
      await this._appointmentsRepository.getAllAppointments(page, limit, query);
    console.log("Appointments from service...", appointments);

    if (appointments) {


      const appointDto = await Promise.all(
        appointments.map(async(item)=>await AppointmentMapper.toResponseDTO(item))
      )


      const profile = new Map<string, string>();
        const updatedAppointments = await Promise.all(
          appointDto.map(async (item) => {
            if (profile.has(item.doctorId)) {
              return { ...item, profile: profile.get(item.doctorId) };
            }
            const user = await this._userRepository.findOne({
              _id: item.userId,
            });
            const profileImg = user ? await getSignedImageURL(user.profile) || "" : "";
            profile.set(item.doctorId, profileImg);
            return { ...item, profile: profileImg };
          })
        );

      const prescriptions = new Map();

      let nwUpdatedAppointments = await Promise.all(
        updatedAppointments.map(async (item: any) => {
          if (prescriptions.has(item.userId)) {
            item.prescriptions = prescriptions.get(item.userId);
            return item;
          } else {
            const prescrs = await this._prescriptionRepository.findAll({
              userId: item.userId,
            });
            if (prescrs) {

              const prescrsDTO: prescriptionResponseDTO[] = [];
              for (const p of prescrs) {
                const dto = await PrescriptionMapper.toPrescriptionResponseDTO(p);
                prescrsDTO.push(dto);
              }


              prescriptions.set(item.userId, prescrsDTO);
              item.prescriptions = prescrs;
            } else {
              item.prescriptions = [];
            }
            return item;
          }
        })
      );

      // if (nwUpdatedAppointments) {
      //   appointments = updatedAppointments;
      // }

      // const typedAppointments: IAppointmentWithPrescription[] =
      //   updatedAppointments.map(
      //     (item) => item as IAppointmentWithPrescription
      //   );
      return { appointments: nwUpdatedAppointments, totalPages };
      
    }

    return { appointments: null, totalPages };
  }

  async cancelAppointment(appointmentId: string): Promise<{
    status: boolean;
    message: string;
  }> {
    console.log("appointment id is ", appointmentId);
    const response = await this._appointmentsRepository.update(appointmentId, {
      appointmentStatus: "cancelled",
      paymentStatus: "refunded",
    });
    if (response) {
      const updateWalet = await this._userRepository.update(response.userId, {
        $inc: { walletBalance: response.fee },
      });
      const updateAnalytics =
        await this._analyticsRepository.uptadeOneWithUpsert(
          { dataSet: "1" },
          { $inc: { totalRevenue: -response.fee } }
        );
      const transaction = await this._transactionRepository.create({
        from: "admin",
        to: "user",
        method: "wallet",
        amount: response.fee,
        paymentFor: "refund",
        userId: response.userId,
        doctorId: response.doctorId,
      });

      if (updateWalet) {
        return {
          status: true,
          message: `your appointment with ${updateWalet.fullName} has been cancelled `,
        };
      } else {
        return {
          message:
            "Your appointment cancletation failed, please try again later",
          status: false,
        };
      }
    }
    // Ensure a return value for all code paths
    return {
      status: false,
      message: "Appointment cancellation failed, appointment not found.",
    };
  }
}
