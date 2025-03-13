import { TutorController } from "../controller/tutorController";
import { OtpRepository } from "../repository/otpRepository";
import { UserRepository } from "../repository/userRepository";
import { OtpService } from "../service/otpService";
import { TutorService } from "../service/tutorService";

const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);

const tutorRepository = new UserRepository();
const tutorService = new TutorService(tutorRepository, otpService);

export const injectedTutorController = new TutorController(tutorService);
