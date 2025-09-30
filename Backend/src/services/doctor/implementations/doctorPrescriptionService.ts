import IPrescriptionDocument from "../../../entities/prescriptionEntities";
import IPrescriptionRepository from "../../../repositories/interfaces/IPrescriptionRepositiory";
import IDoctorPrescriptionService from "../interfaces/IDoctorPrescriptionService";
import { inject, injectable } from "inversify";
import { prescriptionResponseDTO } from "../../../dto/prescriptionDto";
import { PrescriptionMapper } from "../../../mappers/prescription.mapper";

interface medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | undefined;
}
interface prescriptionReq{
  _id?: string;
  appointmentId: string;
  userId: string;
  doctorId: string;
  medicalCondition: string;
  medications: medication[];
  medicationPeriod: number;
  notes?: string;
  createdAt?: Date;
}

@injectable()
export default class DoctorPrescriptionService
  implements IDoctorPrescriptionService
{
  constructor(
    @inject("IPrescriptionRepository")
    private _prescriptionRepository: IPrescriptionRepository
  ) {}

  async getPrescriptions(userId: string): Promise<prescriptionResponseDTO[]> {
    const response = await this._prescriptionRepository.findAll({
      userId: userId,
    });

    const prescriptionsDTO = await Promise.all(
      response.map(async (prescription) => {
        return await PrescriptionMapper.toPrescriptionResponseDTO(prescription);
      })
    );

    return prescriptionsDTO;
  }

  async submitPrescription(prescriptionData: prescriptionReq): Promise<prescriptionResponseDTO> {
    const response = await this._prescriptionRepository.uptadeOneWithUpsert(
      { appointmentId: prescriptionData.appointmentId },
      prescriptionData
    );

    const prescriptionDTO = await PrescriptionMapper.toPrescriptionResponseDTO(response);
    return prescriptionDTO;
  }

  
}
