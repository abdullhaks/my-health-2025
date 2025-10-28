import { injectable, inject } from "inversify";
import { IOtpDocument } from "../../models/otp";
import BaseRepository from "./baseRepository";
import IOtpRepository from "../interfaces/IOtpRepository";
import {Model} from "mongoose";
import { otpDocument } from "../../entities/otpEntities";
import { HttpException } from "../../utils/http.exception";
import { HttpStatusCode } from "../../utils/enum";

@injectable()
export default class OtpRepository
  extends BaseRepository<IOtpDocument>
  implements IOtpRepository
{
  constructor(@inject("otpModel") private _otpModel: Model<IOtpDocument>) {
    super(_otpModel);
  }

  async findLatestOtpByEmail(email: string): Promise<IOtpDocument> {
 
      const otpRecord = await this._otpModel
        .findOne({ email })
        .sort({ createdAt: -1 });

      if (!otpRecord) {
        throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid otp', 'INVALID_CREDENTIALS');
      }
      return otpRecord;
   
  }
}
