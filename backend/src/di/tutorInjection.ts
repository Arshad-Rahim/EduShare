import { TutorController } from "../controller/tutorController";
import { CreateUserController } from "../controller/userController/createUserController";
import { LoginUserController } from "../controller/userController/loginUserController";
import { UserRepository } from "../repository/userRepository";
import { CreateUserService } from "../service/user/createUserService";
import { LoginUserService } from "../service/user/loginUserService";


const tutorRepository = new UserRepository();

const createUserService = new CreateUserService(tutorRepository)
const loginUserService = new LoginUserService(tutorRepository)


// export const injectedTutorController = new TutorController(tutorService);
export const injectedCreateTutorController = new CreateUserController(createUserService)
export const injectedLoginTutorController = new LoginUserController(loginUserService)