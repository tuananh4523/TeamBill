export type TeamPrivacy = "public" | "private" | "invite-only";

export type TeamStatus = "active" | "inactive" | "archived";

export type Team = {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  refCode: string;
  createdBy: string;
  membersCount: number;
  walletId?: string;
  privacy: TeamPrivacy;
  status: TeamStatus;
  totalExpense: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamPayload = {
  name: string;
  description?: string;
  avatar?: string;
  createdBy: string;
  walletId?: string;
  privacy?: TeamPrivacy;
};
