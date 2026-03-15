export type ExpenseStatus = "pending" | "completed" | "cancelled";

export type SplitMethod = "equal" | "percentage" | "custom";

export type Expense = {
  _id: string;
  teamId: string;
  createdBy: string;

  title: string;
  amount: number;

  category?: string;
  description?: string;

  status: ExpenseStatus;
  paidBy?: string;

  splitMethod: SplitMethod;

  date: string;

  createdAt: string;
  updatedAt: string;
};

export type CreateExpensePayload = {
  teamId: string;
  createdBy: string;

  title: string;
  amount: number;

  category?: string;
  description?: string;

  paidBy?: string;
  splitMethod?: SplitMethod;

  date?: string;
};

export type UpdateExpensePayload = {
  id: string;
  data: Partial<CreateExpensePayload>;
};
