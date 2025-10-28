import { NextFunction, Request, Response } from "express";
import IAdminDoctorCtrl from "../interfaces/IAdminDoctorController";
import { inject, injectable } from "inversify";
import IAdminDoctorService from "../../../services/admin/interfaces/IAdminDoctorService";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

@injectable()
export default class AdminDoctorController implements IAdminDoctorCtrl {
  constructor(
    @inject("IAdminDoctorService")
    private _adminDoctorService: IAdminDoctorService
  ) {}

  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const { page, search, limit, onlyPremium, toVerify } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;
      const onlyPremiumBool = onlyPremium === "true" ? true : false;

      const result = await this._adminDoctorService.getDoctors(
        pageNumber,
        search as string | undefined,
        limitNumber,
        onlyPremiumBool,
        toVerify === "true" ? true : false
      );

      if (!result) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "fetching doctors has been fialed " });
      }
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const response = await this._adminDoctorService.getDoctor(id);

      if (!response) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "fetching doctor has been fialed " });
      }

      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async verifyDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const response = await this._adminDoctorService.verifyDoctor(id);
      if (!response) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "verifying doctor has been failed " });
      }

      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async declineDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const response = await this._adminDoctorService.declineDoctor(id, reason);
      if (!response) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "declining doctor has been failed " });
      }

      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async block(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;


      const result = this._adminDoctorService.block(id);


      if (!result) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "blocking doctors has been fialed " });
      }
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async unblock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;


      const result = this._adminDoctorService.unblock(id);


      if (!result) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "blocking doctors has been fialed " });
      }
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
