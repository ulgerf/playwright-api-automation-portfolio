export type UserStatus = "active" | "inactive";
export type Gender = "female" | "male";

export interface UserInput {
  name?: string;
  gender?: string;
  email?: string;
  status?: string;
}

export interface User {
  id: number;
  name: string;
  gender: Gender;
  email: string;
  status: UserStatus;
}

export interface ApiError {
  field?: string;
  message: string;
}
