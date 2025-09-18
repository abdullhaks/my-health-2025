import BaseRepository from "./baseRepository";
import IUnAvailableDayRepository from "../interfaces/IUnAvailableDayRepository";
import { IUnAvailableDayDocument, unAvailableDayDocument } from "../../entities/unAvailableDayEntities";
import { inject, injectable } from "inversify";
import {Model} from "mongoose";

@injectable()
export default class UnAvailableDayRepository
  extends BaseRepository<IUnAvailableDayDocument>
  implements IUnAvailableDayRepository
{
  constructor(
    @inject("unAvailableDayModel") private _unAvailableDayModel: Model<unAvailableDayDocument>
  ) {
    super(_unAvailableDayModel);
  }
}
