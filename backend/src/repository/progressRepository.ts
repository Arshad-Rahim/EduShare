import { IProgressRepository } from "../interfaces/repositoryInterfaces/IProgressRepository";
import { progressModel } from "../models/userProgressModel";

export class ProgressRepository implements IProgressRepository {
   
  async markLessonCompleted(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    try {
        const existingProgress = await progressModel.findOne({
          userId,
          courseId,
          lessonId,
        });
        if (existingProgress){
            return
        }
          await progressModel.create({
            userId,
            courseId,
            lessonId,
            completedAt: new Date(),
          });
    } catch (error) {
        console.error("Error marking lesson as completed:", error);
        throw new Error("Failed to mark lesson as completed");
    }
   
  }
  

  async getCompletedLessons(userId:string,courseId:string):Promise<string[]>{
    try {
         const progressRecords = await progressModel
           .find({ userId, courseId })
           .select("lessonId")
           .lean();

         return progressRecords.map((record) => record.lessonId.toString());
        
    } catch (error) {
         console.error("Error fetching completed lessons:", error);
         throw new Error("Failed to fetch completed lessons");
    }
    
  }
}