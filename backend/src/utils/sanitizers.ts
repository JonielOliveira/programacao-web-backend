import { CreateUserInput, SanitizedCreateUserInput, UpdateUserInput } from '../types/user';

export function sanitizeCreateUserInput(input: CreateUserInput): SanitizedCreateUserInput {
  return {
    username: input.username.trim().toLowerCase(),
    email: input.email.trim(),
    fullName: input.fullName.trim(),
    role: input.role?.trim() || '1',
    status: input.status?.trim().toUpperCase() || 'A',
  };
}

export function sanitizeUpdateUserInput(input: UpdateUserInput): UpdateUserInput {
  return {
    username: input.username?.trim().toLowerCase(),
    email: input.email?.trim(),
    fullName: input.fullName?.trim(),
    role: input.role?.trim(),
    status: input.status?.trim().toUpperCase(),
  };
}
