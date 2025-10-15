import { inject, injectable } from "inversify";
import IAdminUserService from "../interfaces/IAdminUserService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IUser, IUserDocument } from "../../../dto/userDTO";

@injectable()
export default class AdminUserService implements IAdminUserService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository
  ) {}
  async getUsers(
    page: number,
    search: string | undefined,
    limit: number
  ): Promise<{ users: IUserDocument[]; totalPages: number }> {
    const response = await this._userRepository.getUsers(page, search, limit);
    return response;
  }

  async block(id: string): Promise<IUserDocument | null> {
    const response = await this._userRepository.blockUser(id);


    return response;
  }

  async unblock(id: string): Promise<IUserDocument | null> {
    const response = await this._userRepository.unblockUser(id);


    return response;
  }
}
