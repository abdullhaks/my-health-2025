import { Request, Response } from "express";
import IDoctorChatCtrl from "../interfaces/IDoctorChatCtrl";
import { inject, injectable } from "inversify";
import IDoctorChatService from "../../../services/doctor/interfaces/IDoctorChatService";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

@injectable()
export default class DoctorChatController implements IDoctorChatCtrl {
  constructor(
    @inject("IDoctorChatService") private _doctorChatService: IDoctorChatService
  ) {}

  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userIds } = req.body;


      if (!Array.isArray(userIds) || userIds.length !== 2) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({
            message: "Exactly two user IDs (doctor and user) are required",
          });
        return;
      }
      // if (!userIds.includes(req.userId)) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Doctor ID must be included in userIds" });
      //   return;
      // }
      const conversation =
        await this._doctorChatService.createOrGetConversation(userIds);
      res.status(HttpStatusCode.CREATED).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.doctorId;
      let from = req.query.from as string | undefined;

      if (!doctorId || !from) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Doctor ID is required and doc location" });
        return;
      }
      // if (doctorId !== req.userId) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Unauthorized access" });
      //   return;
      // }
      const conversations = await this._doctorChatService.getUserConversations(
        doctorId,
        from as string
      );
      res.status(HttpStatusCode.OK).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
     

      const { conversationId, senderId, content } = req.body;


      if (!conversationId || !senderId || !content) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({
            message: "Conversation ID, sender ID, and content are required",
          });
        return;
      }
      // if (senderId !== req.userId) {
      //   res.status(403).json({ message: "Unauthorized action" });
      //   return;
      // }

      // Validate conversation existence
      // const conversation = await Conversation.findById(conversationId);
      // if (!conversation) {
      //   res.status(404).json({ message: "Conversation not found" });
      //   return;
      // }

      const message = await this._doctorChatService.sendMessage(
        conversationId,
        senderId,
        content
      );
      res.status(HttpStatusCode.CREATED).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      if (!conversationId) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Conversation ID is required" });
        return;
      }
      const messages = await this._doctorChatService.getMessages(
        conversationId
      );
      res.status(HttpStatusCode.OK).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
