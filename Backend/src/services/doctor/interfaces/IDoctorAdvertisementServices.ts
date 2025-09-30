import { IAdvertisement } from "../../../dto/advertisementDto";
import { advertisementResponseDTO } from "../../../dto/advertisementDto";

interface IGetAddsResponse {
  adds: advertisementResponseDTO[];
  totalPages: number;
}

export default interface IDoctorAdvertisementService {
  createAdvertisement(addData: any): Promise<advertisementResponseDTO>;
  getAdds(
    doctorId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<IGetAddsResponse>;
}
