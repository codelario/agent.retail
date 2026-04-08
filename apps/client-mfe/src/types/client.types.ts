export type { IClient as Client, UserRole } from '@learning/entities';

export interface ClientActionEvent {
  type: 'select' | 'bookmark' | 'delete';
  clientId: string;
  userRole: UserRole;
}
