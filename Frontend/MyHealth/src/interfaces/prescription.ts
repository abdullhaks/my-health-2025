interface medication { name: string; dosage: string; frequency: string; duration: string; instructions?: string | undefined; }

export interface prescriptionData {
    
      _id:string,
      appointmentId: string,
      userId: string,
      doctorId: string,
      medicalCondition:string,
      medications: medication[],
      medicationPeriod:number,
      notes?: string,
      createdAt?: Date
    
}