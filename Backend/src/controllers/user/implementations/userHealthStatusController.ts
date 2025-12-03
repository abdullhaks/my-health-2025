import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IUserHealthStatusController from "../interfaces/IUserHealthStatusController";
import { MESSAGES } from "../../../utils/messages";
import { GoogleGenerativeAI } from "@google/generative-ai";

@injectable()
export default class UserHealthStatusController implements IUserHealthStatusController {
  constructor(
    // @inject("IUserHealthStatusService") private _healthStatusService: IUserHealthStatusService
  ) {}

  async checkHealthStatus(req: Request, res: Response): Promise<void> {
    try {
     
        console.log("Request Body:", req.body);
        let {promtData} = req.body;

        console.log("promtData:", promtData);

        let geminikey = process.env.GEMINI_API_KEY || "";

        console.log("Gemini API Key:", geminikey);

    const genAI = new GoogleGenerativeAI(geminikey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(promtData);

    console.log("Generation Result:", result);

    const reply = result.response.text();

    console.log("Generated Text:", reply);

    res.status(HttpStatusCode.OK).json({
        message: "Blogs fetched successfully",
        data: reply,
      });
    } catch (err) {
      console.error("Error health status checkup with AI:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.server.serverError,
      });
    }
  }
}
