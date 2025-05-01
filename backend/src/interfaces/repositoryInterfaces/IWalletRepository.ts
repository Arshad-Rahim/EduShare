import { TWallet } from "../../types/wallet";

export interface IWalletRepository{
    walletDetails(userId:string):Promise<TWallet | null>;

}