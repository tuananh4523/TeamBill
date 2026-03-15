export type WalletStatus = "active" | "inactive" | "locked";

export type WalletType = "personal" | "group";

export type Wallet = {
  _id: string;
  userId: string;

  refCode: string;
  walletName: string;
  walletType: WalletType;

  balance: number;
  totalDeposit: number;
  totalWithdraw: number;

  withdrawLimit: number;
  depositLimit: number;

  bankAccount_holderName?: string;
  bankAccount_number?: string;
  bankAccount_bankCode?: string;
  bankAccount_napasCode?: string;
  bankAccount_bankName?: string;

  status: WalletStatus;
  pinCode?: string;

  isLinkedBank: boolean;

  activatedAt?: string;
  lastUpdated?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateWalletPayload = {
  userId: string;
  walletName: string;
  walletType?: WalletType;
};

export type UpdateWalletPayload = Partial<CreateWalletPayload>;
