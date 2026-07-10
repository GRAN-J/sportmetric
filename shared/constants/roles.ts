// Roles de usuario
export const ROLES = {
  STUDENT: 'STUDENT',
  EVALUATOR: 'EVALUATOR',
  ADMIN: 'ADMIN',
  RESEARCHER: 'RESEARCHER',
} as const;

// Tipo para los roles
export type Role = typeof ROLES[keyof typeof ROLES];