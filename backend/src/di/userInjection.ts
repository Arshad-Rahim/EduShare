import { UserController } from "../controller/userController";
import { OtpRepository } from "../repository/otpRepository";
import { UserRepository } from "../repository/userRepository";
import { OtpService } from "../service/otpService";
import { UserService } from "../service/userService";

const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);

const userRepository = new UserRepository();
const userService = new UserService(userRepository, otpService);

export const injectedUserController = new UserController(userService);
