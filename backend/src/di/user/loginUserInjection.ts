import { LoginUserController } from "../../controller/userController/loginUserController";
import { LoginFindByEmailUserRepository } from "../../repository/userRepository/loginFindByEmailUserRepository";
import { LoginUserService } from "../../service/user/loginUserService";

const loginFindByEmailUserRepository = new LoginFindByEmailUserRepository();
const loginUserService = new LoginUserService(loginFindByEmailUserRepository);


export const injectedLoginUserController = new LoginUserController(loginUserService)