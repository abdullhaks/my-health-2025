import { inject, injectable } from "inversify";
import IUserDashboardService from "../interfaces/IUserDashboardService";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IBlog } from "../../../dto/blogDto";
import { IAdvertisement } from "../../../dto/advertisementDto";

@injectable()
export default class UserDashboardService implements IUserDashboardService {
  constructor(
    @inject("IBlogRepository") private _blogRepository: IBlogRepository,
    @inject("IAdvertisementRepository")
    private _advertisementRepository: IAdvertisementRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository
  ) {}

  async getDashboardContent(
    days: number,
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<{
    blogs: IBlog[];
    advertisements: IAdvertisement[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let user = await this._userRepository.findOne({ _id: userId });

      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      let blogs = await this._blogRepository.getBlogsByTimePeriod(startDate);
      console.log("intial blogs........",blogs)

      if(blogs.length === 0){
        blogs = await this._blogRepository.findAll({}, { sort: { createdAt: -1 }, limit: 3 });
      console.log("then... blogs........",blogs)

      }
      const advertisements =
        await this._advertisementRepository.getAdvertisementsByTimePeriodAndTags(
          startDate,
          user.tags,
          latitude,
          longitude
        );

      return { blogs, advertisements };
    } catch (error) {
      console.error("Error in getDashboardContent:", error);
      throw new Error("Failed to fetch dashboard content");
    }
  }
}
