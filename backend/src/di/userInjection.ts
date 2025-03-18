import { CreateUserController } from "../controller/userController/createUserController";
import { FindAllUsersController } from "../controller/userController/findAllUsersController";
import { GetUsersController } from "../controller/userController/getUsersController";
import { LoginUserController } from "../controller/userController/loginUserController";
import { ResetPasswordController } from "../controller/userController/resetPasswordController";
import { VerifyEmailController } from "../controller/userController/verifyEmailController";
import { UserRepository } from "../repository/userRepository";
import { CreateUserService } from "../service/user/createUserService";
import { FindAllUsersService } from "../service/user/findAllUsers";
import { LoginUserService } from "../service/user/loginUserService";
import { PaginatedUserService } from "../service/user/paginatedUserService";
import { ResetPasswordService } from "../service/user/resetPasswordService";
import { VerifyEmailUserService } from "../service/user/verifyEmailUserService";
import { VerifyOtpToRegisterUserService } from "../service/user/verifyOtpToRegisterUserService";

const userRepository = new UserRepository();

const createUserService = new CreateUserService(userRepository)
const loginUserService = new LoginUserService(userRepository)
const verifyEmailUserService = new VerifyEmailUserService(userRepository)
const findAllUsersService = new FindAllUsersService(userRepository)
const resetPasswordService = new ResetPasswordService(userRepository)
const paginatedUserService = new PaginatedUserService(userRepository)


export const injectedCreateUserController = new CreateUserController(createUserService)
export const injectedLoginUserController = new LoginUserController(loginUserService)
export const injectedVerifyUserController = new VerifyEmailController(verifyEmailUserService)
export const injectedFindAllUserController = new FindAllUsersController(findAllUsersService)
export const injectedResetPasswordController = new ResetPasswordController(resetPasswordService)
export const injectedPaginatedUserController = new GetUsersController(paginatedUserService)