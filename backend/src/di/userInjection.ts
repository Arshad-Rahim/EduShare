import { CreateUserController } from "../controller/userController/createUserController";
import { LoginUserController } from "../controller/userController/loginUserController";
import { OtpRepository } from "../repository/otpRepository";
import { UserRepository } from "../repository/userRepository";
import { OtpService } from "../service/otpService";
import { CreateUserService } from "../service/user/createUserService";
import { LoginUserService } from "../service/user/loginUserService";
import { VerifyOtpToRegisterUserService } from "../service/user/verifyOtpToRegisterUserService";

const userRepository = new UserRepository();
// const otpRepository = new OtpRepository();

const createUserService = new CreateUserService(userRepository)
const loginUserService = new LoginUserService(userRepository)
// const otpService = new OtpService(otpRepository)


export const injectedCreateUserController = new CreateUserController(createUserService)
export const injectedLoginUserController = new LoginUserController(loginUserService)
// export const injectedVerifyOtpToRegisterUserController = new verify(otpService)

