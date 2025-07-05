import { SanitizedCreateUserInput } from '../types/user';

export function isValidUsername(username: string): boolean {
  // Letras, números, . _ - entre 3 e 20 caracteres, sem espaços
  const regex = /^(?=[a-zA-Z0-9])[a-zA-Z0-9._-]{1,18}[a-zA-Z0-9]$/;
  return regex.test(username);
}

export function isValidEmail(email: string): boolean {
  // Regex simples e funcional para formato de e-mail
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidFullName(fullName: string): boolean {
  // Aceita letras (com acento), espaços, hífen e apóstrofo. Entre 3 e 50 caracteres.
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{3,50}$/;
  return regex.test(fullName.trim());
}

export function validateUserInput(input: Partial<SanitizedCreateUserInput>): void {
  const { username, email, fullName, role, status } = input;

  if (username !== undefined && !isValidUsername(username)) {
    throw new Error("Username inválido. Use apenas letras, números, pontos, underscores ou hífens, entre 3 e 20 caracteres.");
  }

  if (email !== undefined && !isValidEmail(email)) {
    throw new Error("Formato de e-mail inválido.");
  }

  if (fullName !== undefined && !isValidFullName(fullName)) {
    throw new Error("Nome completo inválido. Use apenas letras, espaços, apóstrofos e hífens, entre 3 e 100 caracteres.");
  }

  if (role !== undefined && !['0', '1'].includes(role)) {
    throw new Error("Role inválido. Os valores permitidos são '0' (Admin) ou '1' (Usuário comum).");
  }

  if (status !== undefined && !['A', 'I'].includes(status)) {
    throw new Error("Status inválido. Os valores permitidos na criação são 'A' (Ativo) ou 'I' (Inativo).");
  }
}
