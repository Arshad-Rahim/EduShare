import { IProgressService } from "../interfaces/serviceInterfaces/progressService";
import { ProgressRepository } from "../repository/progressRepository";

export class ProgressService implements IProgressService {
  constructor(private _progressRepository: ProgressRepository) {}

  async markLessonCompleted(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    await this._progressRepository.markLessonCompleted(
      userId,
      courseId,
      lessonId
    );
  }

  async getCompletedLessons(
    userId: string,
    courseId: string
  ): Promise<string[]> {
   return await this._progressRepository.getCompletedLessons(userId,courseId);
  }
}