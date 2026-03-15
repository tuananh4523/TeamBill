export type MemberRole = "owner" | "admin" | "member";

export type MemberStatus = "active" | "inactive" | "left";

export type Member = {
  _id: string;
  userId: string;
  teamId: string;

  name: string;
  email: string;
  avatar?: string;

  role: MemberRole;
  status: MemberStatus;

  joinedAt?: string;
  leftAt?: string;

  contribution: number;
  balance: number;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateMemberPayload = {
  userId: string;
  teamId: string;
  name: string;
  email: string;
  avatar?: string;
  role?: MemberRole;
};

export type UpdateMemberPayload = Partial<CreateMemberPayload>;
