import IUserProfileService from "../interfaces/IuserProfileServices";
import { IUser } from "../../../dto/userDTO";
import { inject, injectable } from "inversify";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import AWS from "aws-sdk";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import bcrypt from "bcryptjs";
import UserRepository from "../../../repositories/implementations/userRepository";
import { IUserResponse } from "../../../dto/userDTO";
import { verifyRefreshToken } from "../../../utils/jwt";

@injectable()
export default class UserProfileService implements IUserProfileService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository
  ) {}

  async updateProfile(
    refreshToken: string,
    userData: Partial<IUser>
  ): Promise<Partial<IUserResponse>> {

    try {
      if (!refreshToken) {
            throw new Error("Invalid credentials");
          };
      
      
          const decoded = verifyRefreshToken(refreshToken);
          if (!decoded) {
            throw new Error("Invalid credentials");
          }
      
          let id = decoded.id;
      const findedUser = await this._userRepository.findOne({ _id: id });

      if (!findedUser) {
        throw new Error("Profile updation faild");
      }

      if (userData.location?.text) {
        var locTags = userData.location.text
          .split(",")
          .splice(0, 2)
          .map((tag) => tag.toLowerCase().trim());
        userData.tags = [
          ...(Array.isArray(findedUser.tags)
            ? findedUser.tags
            : typeof findedUser.tags === "string"
            ? [findedUser.tags]
            : []),
          ...locTags,
        ];
      }
      const updatedUser = await this._userRepository.update(id, userData);

      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser.toObject();

        if (userWithoutPassword.profile) {
          userWithoutPassword.profile = await getSignedImageURL(
            userWithoutPassword.profile
          );
        }
        return {
          message: "updated successful",
          updatedUser: userWithoutPassword,
        };
      }

      return {};
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  async updateUserDp(
    refreshToken: string,
    updatedFields: Partial<IUser>,
    fileKey: string | undefined
  ): Promise<IUser> {
    try {

       if (!refreshToken) {
            throw new Error("Invalid credentials");
          };
      
      
          const decoded = verifyRefreshToken(refreshToken);
          if (!decoded) {
            throw new Error("Invalid credentials");
          }
      
          let id = decoded.id;

      const updatePayload = {
        ...updatedFields,
        ...(fileKey && { profile: fileKey }),
      };

      const updatedUser = await this._userRepository.update(
        id,
        updatePayload
      );

      if (!updatedUser) {
        throw new Error("failed to update DP");
      }

      updatedUser.profile = await getSignedImageURL(updatedUser.profile);

      return updatedUser as IUser;
    } catch (error) {
      console.error("Service error:", error);
      throw new Error("Failed to update profile");
    }
  }

  async changePassword(
    refreshToken: string,
    data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ): Promise<IUser> {
    try {

       if (!refreshToken) {
            throw new Error("Invalid credentials");
          };
      
      
          const decoded = verifyRefreshToken(refreshToken);
          if (!decoded) {
            throw new Error("Invalid credentials");
          }
      
          let id = decoded.id;
      const existingUser = await this._userRepository.findOne({ _id: id });

      if (!existingUser) {
        throw new Error("Invalid credentials");
      }


      // Corrected the argument order for bcrypt.compare
      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        existingUser.password
      );


      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Check if new password matches confirm password
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      // Hash the new password and update it
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);


      const updatedUser = await this._userRepository.update(
        existingUser._id.toString(),
        { password: hashedNewPassword }
      );
      if (!updatedUser) {
        throw new Error("Failed to update password");
      }
      return updatedUser as IUser;
    } catch (error) {
      console.error("profile service error:", error);
      throw new Error("Failed to change password");
    }
  }
}
