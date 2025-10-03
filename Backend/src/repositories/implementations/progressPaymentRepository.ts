import { injectable, inject } from "inversify";
import { IProgressPaymentDocument } from "../../entities/progressingPayment";
import BaseRepository from "./baseRepository";
import IProgressPaymentRepository from "../interfaces/IprogressPaymentRepository";
import {Model} from "mongoose";

@injectable()

export default class ProgressPaymentRepository
  extends BaseRepository<IProgressPaymentDocument>
  implements IProgressPaymentRepository
{
  constructor(@inject("progressPaymentModel") private _progressPaymentModel: Model<IProgressPaymentDocument>) {
    super(_progressPaymentModel);
  }

  
}
