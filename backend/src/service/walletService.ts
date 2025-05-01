import { IWalletRepository } from "../interfaces/repositoryInterfaces/IWalletRepository";
import { IWalletService } from "../interfaces/serviceInterfaces/walletService";
import { TWallet } from "../types/wallet";

export class WalletService implements IWalletService{
    constructor(private _walletRepository:IWalletRepository){}


    async walletDetails(userId: string): Promise<TWallet | null> {
        return await this._walletRepository.walletDetails(userId)
    }

}