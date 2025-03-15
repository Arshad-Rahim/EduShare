import { CreateUserController } from "../controller/userController/createUserController";
import { LoginUserController } from "../controller/userController/loginUserController";
import { VerifyEmailController } from "../controller/userController/verifyEmailController";
import { OtpRepository } from "../repository/otpRepository";
import { UserRepository } from "../repository/userRepository";
import { OtpService } from "../service/otp/otpService";
import { CreateUserService } from "../service/user/createUserService";
import { LoginUserService } from "../service/user/loginUserService";
import { VerifyEmailUserService } from "../service/user/verifyEmailUserService";
import { VerifyOtpToRegisterUserService } from "../service/user/verifyOtpToRegisterUserService";

const userRepository = new UserRepository();

const createUserService = new CreateUserService(userRepository)
const loginUserService = new LoginUserService(userRepository)
const verifyEmailUserService = new VerifyEmailUserService(userRepository)


export const injectedCreateUserController = new CreateUserController(createUserService)
export const injectedLoginUserController = new LoginUserController(loginUserService)
export const injectedVerifyUserController = new VerifyEmailController(verifyEmailUserService)
