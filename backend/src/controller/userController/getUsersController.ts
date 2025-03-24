import { Request, Response } from "express";
import { IPaginatedUserService } from "../../interfaces/serviceInterfaces/user/paginatedUserService";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";

export class GetUsersController {
  constructor(private PaginatedUserService: IPaginatedUserService) {}

  async handle(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const role = req.query.role as string | undefined;
        const result = await this.PaginatedUserService.getUsers({
          page,
          limit,
          search,
          role,
        });
        // console.log("REsult",result)
        res.status(200).json(result);
        
    } catch (error) {
      if (error instanceof CustomError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
