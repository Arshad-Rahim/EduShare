import { Request, Response } from "express";
import { TUserRegister } from "../types/user";
import { IUserService } from "../interfaces/serviceInterfaces/userServiceInterface";

export class UserController {
  constructor(private userService: IUserService) {}

  async createUser(req: Request, res: Response) {
    try {
      const data: TUserRegister = req.body;

      await this.userService.createUser(data);

      res.status(200).json({
        success: true,
        message: "user created succesfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }

  async verifyOtpToRegister(req: Request, res: Response) {
    try {
      const data = req.body;
      const user = await this.userService.verifyOtpToRegister(data);
      res.status(200).json({ message: "OTP verified successfully", user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
}
