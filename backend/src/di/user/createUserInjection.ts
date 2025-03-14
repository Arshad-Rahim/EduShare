import { CreateUserController } from "../../controller/userController/createUserController";
import { CreateUserRepository } from "../../repository/userRepository/createUserRepository";
import { FindByEmailUserRepository } from "../../repository/userRepository/findByEmaiUserRepository";
import { CreateUserService } from "../../service/user/createUserService";

const findByEmailRepository = new FindByEmailUserRepository();

const createUserRepository = new CreateUserRepository();
const createUserService = new CreateUserService(
  findByEmailRepository,
  createUserRepository
);

export const injectedCreateUserController = new CreateUserController(
  createUserService
);
