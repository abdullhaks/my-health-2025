import { Request, Response } from "express";

export default interface IConversationController {
  createConversation(req: Request, res: Response): Promise<void>;
  getConversations(req: Request, res: Response): Promise<void>;
}
