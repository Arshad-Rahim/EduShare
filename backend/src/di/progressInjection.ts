import { ProgressController } from "../controller/progressController";
import { ProgressRepository } from "../repository/progressRepository";
import { ProgressService } from "../service/progressService";

const progressRepository = new ProgressRepository();
const progressService = new ProgressService(progressRepository);


export const injectedProgressController = new ProgressController(progressService)