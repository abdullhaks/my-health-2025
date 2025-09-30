import { advertisementResponseDTO,IAdvertisement } from "../dto/advertisementDto";

export class AdvertisementMapper {
    static async toResponseDTO(advertisement: IAdvertisement): Promise<advertisementResponseDTO> {

        return{
            
            _id: advertisement._id.toString(),
            title: advertisement.title,
            author: advertisement.author,
            authorId: advertisement.authorId,
            location: advertisement.location,
            tags: advertisement.tags,
            videoUrl: advertisement.videoUrl,
            pack: advertisement.pack,
            fee: advertisement.fee,
            views: advertisement.views,
            clicks: advertisement.clicks,
            expDate: advertisement.expDate,
            createdAt: advertisement.createdAt,

        }
    }
}