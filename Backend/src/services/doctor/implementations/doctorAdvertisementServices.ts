import { inject, injectable } from "inversify";
import IDoctorAdvertisementService from "../interfaces/IDoctorAdvertisementServices";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";
import { advertisementRequestDTO, IAdvertisement } from "../../../dto/advertisementDto";
import { advertisementResponseDTO } from "../../../dto/advertisementDto";
import { AdvertisementMapper } from "../../../mappers/advertisement.mapper";


interface IGetAddsResponse {
  adds: advertisementResponseDTO[];
  totalPages: number;
}

@injectable()
export default class DoctorAdvertisementService
  implements IDoctorAdvertisementService
{
  constructor(
    @inject("IAdvertisementRepository")
    private _advertisementRepository: IAdvertisementRepository
  ) {}

  async createAdvertisement(addData: advertisementRequestDTO): Promise<advertisementResponseDTO> {
    if (addData.tags.length) {
      addData.tags = addData.tags.map((item: string) => item.toLowerCase());
    }
    const response = await this._advertisementRepository.create(addData);
    const advertisementDto = await AdvertisementMapper.toResponseDTO(response)
    return advertisementDto;
  }

  async getAdds(
    doctorId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<IGetAddsResponse> {
    const {adds,totalPages} = await this._advertisementRepository.getAdds(
      doctorId,
      pageNumber,
      limitNumber
    );
    const addsDto = await Promise.all(
      adds.map(async (item)=>await AdvertisementMapper.toResponseDTO(item))
    )

    return {adds:addsDto,totalPages};
  }
}
