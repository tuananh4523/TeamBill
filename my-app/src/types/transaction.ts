/* transaction entity */

export type TransactionType = "income" | "expense"

export type Transaction = {
  _id: string
  walletId?: string
  categoryId?: string
  amount: number
  type: TransactionType | "deposit" | "withdraw" | "transfer" | "payment"
  note?: string
  /** Mã giao dịch (từ API) */
  code?: string
  /** Chiều: in | out (từ API) */
  direction?: "in" | "out"
  /** Trạng thái */
  status?: 'pending' | 'completed' | 'failed'
  /** Mô tả (từ API) */
  description?: string
  createdAt?: string
  updatedAt?: string
}


/* tạo transaction */

export type CreateTransactionPayload = {
  walletId: string
  categoryId?: string
  amount: number
  type: TransactionType
  note?: string
}


/* cập nhật transaction */

export type UpdateTransactionPayload = {
  categoryId?: string
  amount?: number
  type?: TransactionType
  note?: string
}


/* response khi lấy danh sách */

export type TransactionListResponse = {
  data: Transaction[]
}


/* response khi lấy chi tiết */

export type TransactionDetailResponse = {
  data: Transaction
}