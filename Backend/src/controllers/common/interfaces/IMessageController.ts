import { Request, Response } from "express";

export default interface IMessageController {
  sendMessage(req: Request, res: Response): Promise<void>;
  getMessages(req: Request, res: Response): Promise<void>;
}
