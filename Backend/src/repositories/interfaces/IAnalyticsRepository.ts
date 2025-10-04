import BaseRepository from "../implementations/baseRepository";
import { IAnalyticsDocument } from "../../entities/analyticsEntities";
import { FilterQuery, UpdateQuery } from "mongoose";

export default interface IAnalyticsRepository
  extends BaseRepository<IAnalyticsDocument> {
  uptadeOneWithUpsert(filter: FilterQuery<IAnalyticsDocument>, update: UpdateQuery<IAnalyticsDocument>): Promise<IAnalyticsDocument>;
}
