import { FindNotificationController } from "../controller/tutorController/findNotificationController";
import { TutorController } from "../controller/tutorController/tutorController";
import { UpdateRejectedReasonTutorController } from "../controller/tutorController/updateRejecteReasonTutorController";
import { UpdateTutorController } from "../controller/tutorController/updateTutorController";
import { CreateUserController } from "../controller/userController/createUserController";
import { LoginUserController } from "../controller/userController/loginUserController";
import { TutorRepository } from "../repository/tutorProfileRepository";
import { UserRepository } from "../repository/userRepository";
import { JwtService } from "../service/jwt/jwtService";
import { FindNotificationService } from "../service/tutor/findNotificationService";
import { UpdateRejectedReasonTutorService } from "../service/tutor/updateRejectedReasonTutorService";
import { UpdateTutorProfileService } from "../service/tutor/updateTutorProfileService";
import { CreateUserService } from "../service/user/createUserService";
import { LoginUserService } from "../service/user/loginUserService";

const tokenService = new JwtService();

const tutorRepository = new TutorRepository();
const userRepository = new UserRepository();

const createUserService = new CreateUserService(userRepository);
const loginUserService = new LoginUserService(userRepository);
const updateTutorProfileService = new UpdateTutorProfileService(
  tutorRepository
);

const updateRejectedReasonTutorService = new UpdateRejectedReasonTutorService(
  tutorRepository
);

const findNotificationService = new FindNotificationService(tutorRepository);

// export const injectedTutorController = new TutorController(tutorService);
export const injectedCreateTutorController = new CreateUserController(
  createUserService
);
export const injectedLoginTutorController = new LoginUserController(
  loginUserService,
  tokenService
);

export const injectedUpdateTutorController = new UpdateTutorController(
  updateTutorProfileService
);

export const injectedUpdateRejectedReasonTutorService =
  new UpdateRejectedReasonTutorController(updateRejectedReasonTutorService);

export const injectedFindNotificationController =
  new FindNotificationController(findNotificationService);
