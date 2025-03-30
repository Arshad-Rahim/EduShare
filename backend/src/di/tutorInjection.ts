import { TutorController } from "../controller/tutorController";
import { TutorRepository } from "../repository/tutorProfileRepository";
import { TutorService } from "../service/tutorService";


const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository)

export const injectedTutorController = new TutorController(tutorService)






