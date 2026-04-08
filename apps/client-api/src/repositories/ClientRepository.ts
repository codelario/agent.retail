import type { Client, IClientRepository } from '../usecases/types/IClientRepository';

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Ana García',   email: 'ana@example.com',   status: 'active' },
  { id: '2', name: 'Bruno López',  email: 'bruno@example.com', status: 'pending' },
  { id: '3', name: 'Carla Méndez', email: 'carla@example.com', status: 'inactive' },
  { id: '4', name: 'Diego Torres', email: 'diego@example.com', status: 'active' },
];

export class ClientRepository implements IClientRepository {
  async findAll(): Promise<Client[]> {
    return MOCK_CLIENTS;
  }

  async findByStatus(status: string): Promise<Client[]> {
    return MOCK_CLIENTS.filter(c => c.status === status);
  }

  async save(client: Omit<Client, 'id'>): Promise<void> {
    const newClient: Client = { id: (MOCK_CLIENTS.length + 1).toString(), ...client };
    MOCK_CLIENTS.push(newClient);
  }
}
