import {blogResponseDTO, IBlog} from "../dto/blogDto";


export class BlogMapper {
    static async toResponseDTO(blog: IBlog): Promise<blogResponseDTO> {

        return{
            _id: blog._id.toString(),
            title: blog.title,
            thumbnail: blog.thumbnail,
            content: blog.content,
            author: blog.author,
            authorId: blog.authorId,
            img1: blog.img1,
            img2: blog.img2,
            img3: blog.img3,
            tags: blog.tags,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,

        }
}

}