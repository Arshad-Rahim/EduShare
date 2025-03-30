import { googleController } from "../controller/googleController";
import { UserController } from "../controller/userController";
import { RefreshTokenController } from "../controller/refreshTokenController";
import { UserRepository } from "../repository/userRepository";
import { GoogleService } from "../service/googleAuth/googleService";
import { JwtService } from "../service/jwt/jwtService";
import { RefreshTokenService } from "../service/refreshTokenService";
import { UserService } from "../service/userService";

const userRepository = new UserRepository();

const tokenService = new JwtService();

const userService = new UserService(userRepository);

const refreshTokenService = new RefreshTokenService(tokenService);
const googleService = new GoogleService(userRepository);

export const injectedUserController = new UserController(
  userService,
  userRepository
);

export const injectedRefreshTokenController = new RefreshTokenController(
  refreshTokenService
);

export const injectedGoogleController = new googleController(
  googleService,
  tokenService
);
