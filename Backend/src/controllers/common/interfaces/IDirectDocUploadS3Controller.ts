import { Request, Response } from "express";

export default interface IDirectDocUploadS3Controller {
  directUpload(req: Request, res: Response): Promise<void>;
}
