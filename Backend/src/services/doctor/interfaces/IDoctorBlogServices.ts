import { IBlog } from "../../../dto/blogDto";
import { blogResponseDTO } from "../../../dto/blogDto";


export default interface IDoctorBlogService {
  createBlog(blogData: any): Promise<blogResponseDTO>;
  getBLogs(
    authorId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<{ blogs: blogResponseDTO[]; totalPages: number }>;
  updateBLog(blogId: string, blogData: object): Promise<blogResponseDTO | null>;
}
