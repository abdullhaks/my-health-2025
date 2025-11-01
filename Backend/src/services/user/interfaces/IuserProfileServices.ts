import { IUser } from "../../../dto/userDTO";
import { IUserResponse } from "../../../dto/userDTO";

export default interface IUserProfileService {
  updateProfile(
    refreshToken: string,
    userData: Partial<IUser>
  ): Promise<Partial<IUserResponse>>;
  updateUserDp(
    refreshToken: string,
    updatedFields: Partial<IUser>,
    fileKey: string | undefined
  ): Promise<IUser>;
  changePassword(
    refreshToken: string,
    data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ): Promise<IUser>;
}
