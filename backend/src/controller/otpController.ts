import { Request, Response } from "express";
import { IOtpService } from "../interfaces/serviceInterfaces/otpServiceInterface";
import { TOtp } from "../types/otp";

export class OtpController {
  constructor(private otpService: IOtpService) {}

  async otpGenerate(req: Request, res: Response) {
    try {
      const data: TOtp = req.body;

      await this.otpService.otpGenerate(data);

      res.status(200).json({
        success: true,
        message: "Otp Created SucessFully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }
}
