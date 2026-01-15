import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IUserBlogController from "../interfaces/IUserBlogController";
import IUserBlogService from "../../../services/user/interfaces/IUserBlogServices";
import { MESSAGES } from "../../../utils/messages";

@injectable()
export default class UserBlogController implements IUserBlogController {
  constructor(
    @inject("IUserBlogService") private _blogService: IUserBlogService
  ) {}

  async getBlogs(req: Request, res: Response): Promise<void> {
    try {
      const { search = "", page = "1", limit = "10" } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      if (isNaN(pageNumber) || isNaN(limitNumber)) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid page or limit parameters" });
        return;
      }

      const response = await this._blogService.getBlogs(
        search.toString(),
        pageNumber,
        limitNumber
      );
      if (!response || !response.blogs) {
        res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "No blogs found" });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: "Blogs fetched successfully",
        data: response,
      });
    } catch (err) {
      console.error("Error fetching blogs:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.server.serverError,
      });
    }
  };



  async getBlog(req: Request, res: Response): Promise<void> {
    try{

      const {blogId} = req.query;

      if(!blogId){
        res.status(HttpStatusCode.BAD_REQUEST).json({message:"blogId is required"});
        return;
      }
      const response = await this._blogService.getBlog(blogId.toString());

      if(!response){
        res.status(HttpStatusCode.NOT_FOUND).json({message:"Blog not found"});
        return;
      }
      res.status(HttpStatusCode.OK).json({
        message: "Blog fetched successfully",
        data: response,
      });




    }catch(err){
      console.error("Error fetching blog:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.server.serverError,
      });
    }


  };



  
}
