import { TWallet } from "../../types/wallet";

export interface IWalletService{
    walletDetails(userId:string):Promise<TWallet | null>
}