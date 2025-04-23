export interface IProgressService {
  markLessonCompleted(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void>;
  getCompletedLessons(userId: string, courseId: string): Promise<string[]>;
}
