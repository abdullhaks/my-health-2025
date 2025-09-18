import IPrescriptionDocument from "../../entities/prescriptionEntities";
import { prescriptionDocument } from "../../entities/prescriptionEntities";
import IPrescriptionRepository from "../interfaces/IPrescriptionRepositiory";
import BaseRepository from "./baseRepository";
import { inject, injectable } from "inversify";
import {Model} from "mongoose";

@injectable()
export default class PrescriptionRepository
  extends BaseRepository<IPrescriptionDocument>
  implements IPrescriptionRepository
{
  constructor(@inject("prescriptionModel") private _prescriptionModel: Model<prescriptionDocument>) {
    super(_prescriptionModel);
  }

  async uptadeOneWithUpsert(
    filter: any,
    update: any
  ): Promise<IPrescriptionDocument> {
    try {
      const options = { upsert: true, new: true, strict: false };
      const updatedDocument = await this._prescriptionModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      if(!updatedDocument){
        throw new Error ("No document found or updated.")
      }
      return updatedDocument;
    } catch (err) {
      console.log("Error updating document", err);
      throw err;
    }
  }
}
