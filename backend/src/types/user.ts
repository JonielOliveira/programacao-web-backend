export interface CreateUserInput {
  username: string;
  email: string;
  fullName: string;
  role?: string; // '0' (admin) ou '1' (usuário comum)
  status?: string; // 'A', 'I', 'B'
}

export interface SanitizedCreateUserInput {
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  status?: string;
}
