import { IBlog } from "../../../dto/blogDto";
import { blogResponseDTO } from "../../../dto/blogDto";

export default interface IUserBlogService {
  getBlogs(
    search: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<{ blogs: blogResponseDTO[]; totalPages: number }>;

  getBlog(blogId: string): Promise<blogResponseDTO | null>;



}
