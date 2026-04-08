import type { IClient as Client } from "@learning/entities";
export type { Client };

export interface IClientRepository {
  findAll(): Promise<Client[]>;
  findByStatus(status: string): Promise<Client[]>;
  save(client: Omit<Client, 'id'>): Promise<void>;
}
