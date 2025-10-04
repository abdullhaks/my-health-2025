import { IAdmin } from "../../../dto/adminDTO";
import { IResponseDTO } from "../../../dto/commonResponseDto";
import { adminResponseDTO } from "../../../dto/adminDTO";


export default interface IAdminAuthService {
  login(
    userData: Partial<IAdmin>
  ): Promise<{
    message: string;
    admin: adminResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
  forgotPassword(email: string): Promise<{ message: string; email: string }>;
  verifyRecoveryPassword(email: string, recoveryCode: string): Promise<boolean>;
  // getRecoveryPassword(email:string):Promise<>
  // resetPassword(email:string,password:string):Promise<>
  refreshToken(token: string): Promise<IResponseDTO>;
}
