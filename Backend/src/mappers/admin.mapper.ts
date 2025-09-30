import { adminResponseDTO, IAdmin } from "../dto/adminDTO";

export class AdminMapper {
    static async toResponseDTO(admin: IAdmin): Promise<adminResponseDTO> {
        return {
            _id: admin._id.toString(),
            fullName: admin.fullName,
            email: admin.email,
            profile: admin.profile,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
        }
    }
}