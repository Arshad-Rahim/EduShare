import { WalletController } from "../controller/walletController";
import { WalletRepository } from "../repository/walletRepository";
import { WalletService } from "../service/walletService";

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);

export const injectedWalletController = new WalletController(walletService)