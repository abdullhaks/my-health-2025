import { inject, injectable } from "inversify";
import IDetailsService from "../interfaces/IDetailsService";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IMessageDocument } from "../../../entities/messageEntities";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import { IDoctor } from "../../../dto/doctorDTO";
import { IUser } from "../../../dto/userDTO";

@injectable()
export default class DetailsService implements IDetailsService {
  constructor(
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository
  ) {}

  async getDoctor(doctorId: string): Promise<IDoctor> {
    try {

      const response = await this._doctorRepository.findOne({ _id: doctorId });
      if (!response) {
        throw new Error("failed to fetch doctor");
      }


      const {
        password,
        isBlocked,
        isVerified,
        adminVerified,
        graduationCertificate,
        registrationCertificate,
        verificationId,
        walletBalance,
        subscriptionId,
        bankAccHolderName,
        bankAccNo,
        bankIfscCode,
        ...rest
      } = response.toObject();

      // Validate profile field before calling getSignedImageURL
      if (rest.profile) {
        try {
          rest.profile = await getSignedImageURL(rest.profile);
        } catch (profileError) {
          console.error(
            "Error generating signed URL for profile:",
            profileError
          );
          rest.profile = "";
        }
      } else {
        rest.profile = "";
      }

      return rest;
    } catch (error) {
      console.error("Error in getDoctor:", error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<IUser> {
    try {

      const response = await this._userRepository.findOne({ _id: userId });
      if (!response) {
        throw new Error("failed to fetch user");
      }


      const { password, isBlocked, isVerified, walletBalance, ...rest } =
        response.toObject();

      // Validate profile field before calling getSignedImageURL
      if (rest.profile) {
        try {
          rest.profile = await getSignedImageURL(rest.profile);
        } catch (profileError) {
          console.error(
            "Error generating signed URL for profile:",
            profileError
          );
          rest.profile = "";
        }
      } else {
        rest.profile = "";
      }

      return rest;
    } catch (error) {
      console.error("Error in getDoctor:", error);
      throw error;
    }
  }
}
