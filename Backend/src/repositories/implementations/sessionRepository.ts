import { inject, injectable } from "inversify";
import { ISessionDocument, sessionDocument } from "../../entities/sessionEntities";
import ISessionRepository from "../interfaces/ISessionRepository";
import BaseRepository from "./baseRepository";
import {Model} from "mongoose";

@injectable()
export default class SessionRepository
  extends BaseRepository<ISessionDocument>
  implements ISessionRepository
{
  constructor(@inject("sessionModel") private _sessionModel: Model<sessionDocument>) {
    super(_sessionModel);
  }
}
