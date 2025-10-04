import BaseRepository from "../implementations/baseRepository";
import IPrescriptionDocument from "../../entities/prescriptionEntities";
import { FilterQuery, UpdateQuery } from "mongoose";

export default interface IPrescriptionRepository
  extends BaseRepository<IPrescriptionDocument> {
  uptadeOneWithUpsert(filter: FilterQuery<IPrescriptionDocument>, update: UpdateQuery<IPrescriptionDocument>): Promise<IPrescriptionDocument>;
}
