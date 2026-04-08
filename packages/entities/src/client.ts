export type ClientStatus = 'active' | 'inactive' | 'pending';

export interface IClient {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
}
