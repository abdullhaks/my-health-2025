import { inject, injectable } from "inversify";
import IDoctorBlogService from "../interfaces/IDoctorBlogServices";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import { IBlog } from "../../../dto/blogDto";
import { blogResponseDTO} from "../../../dto/blogDto";
import { BlogMapper } from "../../../mappers/blog.mapper";

@injectable()
export default class DoctorBlogService implements IDoctorBlogService {
  constructor(
    @inject("IBlogRepository") private _blogRepository: IBlogRepository
  ) {}

  async createBlog(blogData: any): Promise<blogResponseDTO> {

    const response = await this._blogRepository.create(blogData);
    const blogDto = await BlogMapper.toResponseDTO(response);
    return blogDto;
  }

  async getBLogs(
    authorId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<{ blogs: blogResponseDTO[]; totalPages: number }> {
    const response = await this._blogRepository.getBlogs(
      authorId,
      pageNumber,
      limitNumber
    );
    console.log("blog response....", response);

    const blogDto =await Promise.all(
      response.blogs.map(async(item)=> await BlogMapper.toResponseDTO(item))
    );

    const resp = {blogs:blogDto,totalPages:response.totalPages}

    return resp;
  }

  async updateBLog(blogId: string, blogData: object): Promise<blogResponseDTO | null> {
    const response = await this._blogRepository.update(blogId, blogData);

    const blogDto = await BlogMapper.toResponseDTO(response!);
    return blogDto;
    
  }
}
