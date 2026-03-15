export type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: "admin" | "member";
};

export type SigninPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  password: string;
  email: string;
  fullName: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};