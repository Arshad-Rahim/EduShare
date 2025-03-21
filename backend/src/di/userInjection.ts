import { googleController } from "../controller/googleAuthController/googleController";
import { AcceptTutorController } from "../controller/userController/accepttutorController";
import { CreateUserController } from "../controller/userController/createUserController";
import { DeleteUserController } from "../controller/userController/deleteUserController";
import { FindAllUsersController } from "../controller/userController/findAllUsersController";
import { FindUserByIdController } from "../controller/userController/findUsersByIdController";
import { GetUsersController } from "../controller/userController/getUsersController";
import { LoginUserController } from "../controller/userController/loginUserController";
import { LogoutUserController } from "../controller/userController/logoutUserController";
import { RefreshTokenController } from "../controller/userController/refreshTokenController";
import { ResetPasswordController } from "../controller/userController/resetPasswordController";
import { UpdateStatusController } from "../controller/userController/updateStatusController";
import { VerifyEmailController } from "../controller/userController/verifyEmailController";
import { UserRepository } from "../repository/userRepository";
import { GoogleService } from "../service/googleAuth/googleService";
import { JwtService } from "../service/jwt/jwtService";
import { AcceptTutorService } from "../service/user/acceptTutorService";
import { CreateUserService } from "../service/user/createUserService";
import { DeleteUserService } from "../service/user/deleteUserService";
import { FindAllUsersService } from "../service/user/findAllUsers";
import { FindUserByIdService } from "../service/user/findUserByIdService";
import { LoginUserService } from "../service/user/loginUserService";
import { PaginatedUserService } from "../service/user/paginatedUserService";
import { RefreshTokenService } from "../service/user/refreshTokenService";
import { ResetPasswordService } from "../service/user/resetPasswordService";
import { UpdateStatusService } from "../service/user/updateStateService";
import { VerifyEmailUserService } from "../service/user/verifyEmailUserService";

const userRepository = new UserRepository();

const tokenService = new JwtService();

const createUserService = new CreateUserService(userRepository);
const loginUserService = new LoginUserService(userRepository);
const verifyEmailUserService = new VerifyEmailUserService(userRepository);
const findAllUsersService = new FindAllUsersService(userRepository);
const resetPasswordService = new ResetPasswordService(userRepository);
const paginatedUserService = new PaginatedUserService(userRepository);
const deleteUserService = new DeleteUserService(userRepository);
const updateStatusService = new UpdateStatusService(userRepository);
const acceptTutorService = new AcceptTutorService(userRepository);
const findUserByIdService = new FindUserByIdService(userRepository);
const refreshTokenService = new RefreshTokenService(tokenService)
const googleService = new GoogleService(userRepository)


export const injectedCreateUserController = new CreateUserController(
  createUserService
);
export const injectedLoginUserController = new LoginUserController(
  loginUserService,
  tokenService
);
export const injectedVerifyUserController = new VerifyEmailController(
  verifyEmailUserService
);
export const injectedFindAllUserController = new FindAllUsersController(
  findAllUsersService
);
export const injectedResetPasswordController = new ResetPasswordController(
  resetPasswordService
);
export const injectedPaginatedUserController = new GetUsersController(
  paginatedUserService
);
export const injectedDeleteUserController = new DeleteUserController(
  deleteUserService
);
export const injectedUpdateStatusUserController = new UpdateStatusController(
  updateStatusService
);
export const injectedAcceptTutorController = new AcceptTutorController(
  acceptTutorService
);
export const injectedFindUserByIdController = new FindUserByIdController(
  findUserByIdService,
  userRepository
);

export const injectedRefreshTokenController = new RefreshTokenController(
  refreshTokenService,
  tokenService
);


export const injectedGoogleController = new googleController(
  googleService,
);

export const injectedLogoutUserController = new LogoutUserController();
