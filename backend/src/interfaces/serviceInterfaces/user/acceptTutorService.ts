export interface IAcceptTutorService{
    acceptTutor(tutorId:string):Promise<void>;
}