

export interface IProgressRepository {
  markLessonCompleted(
    lessonId: string,
    courseId: string,
    userId: string
  ): Promise<void>;
  getCompletedLessons(userId: string, courseId: string): Promise<string[]>;
}