import { inject, injectable } from "inversify";
import IUserBlogService from "../interfaces/IUserBlogServices";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import { IBlog } from "../../../dto/blogDto";
import { blogResponseDTO } from "../../../dto/blogDto";
import { BlogMapper } from "../../../mappers/blog.mapper";

@injectable()
export default class UserBlogService implements IUserBlogService {
  constructor(
    @inject("IBlogRepository") private _blogRepository: IBlogRepository
  ) {}

  async getBlogs(
    search: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<{ blogs: blogResponseDTO[]; totalPages: number }> {
    try {
      const response = await this._blogRepository.getBlogsWithSearch(
        search,
        pageNumber,
        limitNumber
      );
      if (!response) {
        throw new Error("No blogs found");
      }

      const blogDto = await Promise.all (
        response.blogs.map(async(item)=> await BlogMapper.toResponseDTO(item))
      )

      const resp = {blogs:blogDto,totalPages:response.totalPages}
      
      return resp;
      
    } catch (error) {
      console.error("Error in getBlogs:", error);
      throw error;
    }
  }
}
