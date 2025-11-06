import { Request, Response } from "express";

export default interface IPaymentController {
  stripeWebhookController(req: Request, res: Response): Promise<void>;
  createOneTimePaymentSession(req: Request, res: Response): Promise<void>;
  progressingPayment(req: Request, res: Response): Promise<void>;
}
