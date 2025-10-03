import IPrescriptionRepository from "../../../repositories/interfaces/IPrescriptionRepositiory";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IUserPrescriptionService from "../interfaces/IUserPrescriptionService";
import { inject, injectable } from "inversify";
import { IPrescription } from "../../../dto/prescriptionDto";
import { prescriptionResponseDTO } from "../../../dto/prescriptionDto";
import { PrescriptionMapper } from "../../../mappers/prescription.mapper";

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

@injectable()
export default class UserPrescriptionService
  implements IUserPrescriptionService
{
  constructor(
    @inject("IPrescriptionRepository")
    private _prescriptionRepository: IPrescriptionRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository
  ) {}

  async getPrescription(
    appointmentId: string
  ): Promise<prescriptionReponseDto> {
    console.log("appointmentId is.....", appointmentId);

    let prescription = await this._prescriptionRepository.findOne({
      appointmentId: appointmentId,
    });

    const prescriptionDTO = await PrescriptionMapper.toPrescriptionResponseDTO(prescription!);

    console.log("prescription is ....", prescription);
    if (prescriptionDTO) {
      var user = await this._userRepository.findOne({
        _id: prescriptionDTO.userId,
      });
      var doctor = await this._doctorRepository.findOne({
        _id: prescriptionDTO.doctorId,
      });

      console.log("user is ....", user);
      console.log("doctor is ....", doctor);

      return {
        prescription:prescriptionDTO,
        user: { fullName: user?.fullName, dob: user?.dob },
        doctor: {
          fullName: doctor?.fullName,
          graduation: doctor?.graduation,
          category: doctor?.category,
          registerNo: doctor?.registerNo,
        },
      };
    } else {
      throw new Error("fetching prescription failed");
    }
  }

  async getLatestPrescription(userId: string): Promise<prescriptionResponseDTO | null> {
    console.log("userId is.....", userId);

    let prescription = await this._prescriptionRepository.findOne(
      { userId: userId },
      { sort: { createdAt: -1 } }
    );

    let prescriptionDTO = null;

    if(prescription){
     prescriptionDTO = await PrescriptionMapper.toPrescriptionResponseDTO(prescription!);
    }


    console.log("prescription is ....", prescription);
    return prescriptionDTO || null;
  }

  async getLatestDoctorPrescription(
    userId: string,
    doctorId: string
  ): Promise<prescriptionResponseDTO | null> {
    console.log("userId is.....", userId);

    let prescription = await this._prescriptionRepository.findOne(
      { userId: userId, doctorId: doctorId },
      { sort: { createdAt: -1 } }
    );

    let prescriptionDTO = null;

    if(prescription){
     prescriptionDTO = await PrescriptionMapper.toPrescriptionResponseDTO(prescription!);
    }


    console.log("prescription is ....", prescription);
    return prescriptionDTO || null;
  }
}
