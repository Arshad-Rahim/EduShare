import { Request, Response } from "express";
import { ITutorService } from "../interfaces/serviceInterfaces/tutorServiceInterface";
import { TUserRegister } from "../types/user";

export class TutorController {
  constructor(private tutorService: ITutorService) {}

  async createUser(req: Request, res: Response) {
    try {
      const data: TUserRegister = req.body;

      await this.tutorService.createUser(data);

      res.status(200).json({
        success: true,
        message: "Tutor created succesfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          successs: false,
          message: error.message,
        });
      }
    }
  }
}
