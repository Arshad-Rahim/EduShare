import { googleController } from "../controller/googleController";
import { UserController } from "../controller/userController";
import { RefreshTokenController } from "../controller/refreshTokenController";
import { UserRepository } from "../repository/userRepository";
import { GoogleService } from "../service/googleAuth/googleService";
import { JwtService } from "../service/jwt/jwtService";
import { RefreshTokenService } from "../service/refreshTokenService";
import { UserService } from "../service/userService";
import { UserProfileRepository } from "../repository/userProfileRepository";

const userRepository = new UserRepository();
const userProfileRepository = new UserProfileRepository();

const tokenService = new JwtService();

const userService = new UserService(userRepository,userProfileRepository);

const refreshTokenService = new RefreshTokenService(tokenService);
const googleService = new GoogleService(userRepository);

export const injectedUserController = new UserController(
  userService,
  userRepository,
  userProfileRepository
);

export const injectedRefreshTokenController = new RefreshTokenController(
  refreshTokenService
);

export const injectedGoogleController = new googleController(
  googleService,
  tokenService
);
