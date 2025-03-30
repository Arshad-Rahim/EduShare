import { AdminController } from "../controller/adminController";
import { TutorRepository } from "../repository/tutorProfileRepository";
import { UserRepository } from "../repository/userRepository";
import { AdminService } from "../service/adminService";

const userRepository = new UserRepository()
const tutorRepository = new TutorRepository();
const adminService = new AdminService(userRepository,tutorRepository);



export const injectedAdminController = new AdminController(adminService);