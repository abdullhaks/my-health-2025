import BaseRepository from "./baseRepository";
import IUnAvailableSessionRepository from "../interfaces/IUnAvailableSessionRepository";
import { IUnAvailableSessionDocument, unAvailableSessionDocument } from "../../entities/unAvailableSessionEntities";
import { inject, injectable } from "inversify";
import {Model} from "mongoose"

@injectable()
export default class UnAvailableSessionRepository
  extends BaseRepository<IUnAvailableSessionDocument>
  implements IUnAvailableSessionRepository
{
  constructor(
    @inject("unAvailableSessionModel") private _unAvailableSessionModel: Model<unAvailableSessionDocument>
  ) {
    super(_unAvailableSessionModel);
  }
}
