export interface IUpdateStatusService{
    updateStatus(id:string,status:boolean):Promise<void>
}