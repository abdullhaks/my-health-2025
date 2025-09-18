import { inject, injectable } from "inversify";
import { IAnalyticsDocument , analyticsDocument} from "../../entities/analyticsEntities";
import IAnalyticsRepository from "../interfaces/IAnalyticsRepository";
import BaseRepository from "./baseRepository";
import { Model } from "mongoose";

@injectable()
export default class AnalyticsRepository
  extends BaseRepository<IAnalyticsDocument>
  implements IAnalyticsRepository
{
  constructor(@inject("analyticsModel") private _analyticsModel: Model<analyticsDocument>) {
    super(_analyticsModel);
  }

  async uptadeOneWithUpsert(
    filter: any,
    update: any
  ): Promise<IAnalyticsDocument> {
    try {
      const options = { upsert: true, new: true, strict: false };
      const updatedDocument = await this._analyticsModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      if (!updatedDocument) {
        throw new Error("No document found or updated.");
      }
      return updatedDocument;
    } catch (err) {
      console.log("Error updating document", err);
      throw err;
    }
  }
}
