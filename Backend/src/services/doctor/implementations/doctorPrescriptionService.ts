import IPrescriptionDocument from "../../../entities/prescriptionEntities";
import IPrescriptionRepository from "../../../repositories/interfaces/IPrescriptionRepositiory";
import IDoctorPrescriptionService from "../interfaces/IDoctorPrescriptionService";
import { inject, injectable } from "inversify";

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

  async getPrescriptions(userId: string): Promise<IPrescriptionDocument[]> {
    const response = await this._prescriptionRepository.findAll({
      userId: userId,
    });
    return response;
  }

  async submitPrescription(prescriptionData: prescriptionReq): Promise<IPrescriptionDocument> {
    const response = await this._prescriptionRepository.uptadeOneWithUpsert(
      { appointmentId: prescriptionData.appointmentId },
      prescriptionData
    );
    return response;
  }
}
