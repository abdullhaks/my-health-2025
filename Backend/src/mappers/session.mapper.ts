import { ISession } from "../dto/sessionDTO";
import { sessionResponseDTO } from "../dto/sessionDTO";


export class SessionMapper {
    static async toSessionResponseDTO(s: ISession): Promise<sessionResponseDTO> {
        return {
            _id: s._id.toString(),
            doctorId: s.doctorId.toString(),
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            duration: s.duration,
            fee: s.fee,
            rRule: s.rRule,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,

        }
    }
}
