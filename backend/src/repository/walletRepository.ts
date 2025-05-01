import { IWalletRepository } from "../interfaces/repositoryInterfaces/IWalletRepository";
import { WalletModel } from "../models/walletModel";
import { TWallet } from "../types/wallet";

export class WalletRepository implements IWalletRepository {
  async walletDetails(userId: string): Promise<TWallet | null> {
    let wallet = await WalletModel.findOne({ userId });
    return wallet;
  }

}
