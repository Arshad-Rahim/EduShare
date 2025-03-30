import { AuthController } from "../controller/authController";
import { UserRepository } from "../repository/userRepository";
import { AuthService } from "../service/authService";
import { JwtService } from "../service/jwt/jwtService";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const tokenService = new JwtService();

export const injectedAuthController = new AuthController(
  authService,
  tokenService
);

