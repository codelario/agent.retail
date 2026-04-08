export type UserRole = 'admin' | 'viewer' | 'editor';

export interface UserContext {
  id: string;
  role: UserRole;
  token: string;
}
