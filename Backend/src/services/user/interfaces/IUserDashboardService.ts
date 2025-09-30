import { IAdvertisement } from "../../../dto/advertisementDto";
import { IBlog } from "../../../dto/blogDto";
import { blogResponseDTO } from "../../../dto/blogDto";
import { advertisementResponseDTO } from "../../../dto/advertisementDto";

export default interface IUserDashboardService {
  getDashboardContent(
    daysNumber: number,
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<{
    blogs: blogResponseDTO[];
    advertisements: advertisementResponseDTO[];
  }>;
}
