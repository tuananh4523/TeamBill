export type VietQRDepositPayload = {
  userId: string
  amount: number
  description?: string
}

export type VietQRDepositResponse = {
  message: string
  qrLink: string
  transactionId: string
  transCode: string
  amount: number

  bankInfo: {
    bankName: string
    holderName: string
    accountNumber: string
  }
}

export type ConfirmDepositResponse = {
  message: string
  wallet: unknown
  transaction: unknown
}