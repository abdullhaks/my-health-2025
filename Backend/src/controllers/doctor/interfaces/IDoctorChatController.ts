import { Request, Response } from "express";

export default interface IDoctorChatController {
  createConversation(req: Request, res: Response): Promise<void>;
  getConversations(req: Request, res: Response): Promise<void>;
  sendMessage(req: Request, res: Response): Promise<void>;
  getMessages(req: Request, res: Response): Promise<void>;
}
