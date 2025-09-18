import { injectable, inject } from "inversify";
import BaseRepository from "./baseRepository";
import IPaymentRepository from "../interfaces/IPaymentRepository";
import { ISubscriptionDocument, subscriptionDocument } from "../../entities/subscriptionEntities";
import {Model} from "mongoose";

@injectable()
export default class PaymentRepository
  extends BaseRepository<ISubscriptionDocument>
  implements IPaymentRepository
{
  constructor(@inject("subscriptionModel") private _subscriptionModel: Model<subscriptionDocument>) {
    super(_subscriptionModel);
  }
}
