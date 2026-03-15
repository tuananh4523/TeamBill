export type SplitType =
  | "equal"
  | "percentage"
  | "custom"

export type Split = {
  _id: string
  expenseId: string
  teamId: string

  total: number
  method: SplitType

  currency?: string
  date?: string
  note?: string

  createdAt?: string
  updatedAt?: string
}