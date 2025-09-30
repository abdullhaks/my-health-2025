import { IPrescription, prescriptionResponseDTO } from "../dto/prescriptionDto";

export class PrescriptionMapper {
    static async toPrescriptionResponseDTO(p: IPrescription): Promise<prescriptionResponseDTO> {
        return {
            _id: p._id.toString(),
            appointmentId: p.appointmentId,
            userId: p.userId,
            doctorId: p.doctorId,
            medicalCondition: p.medicalCondition,
            medications: p.medications,
            notes: p.notes,
            createdAt: p.createdAt,
        }
    }
}