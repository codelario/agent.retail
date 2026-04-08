import type { Client, IClientRepository } from './types/IClientRepository';

export interface CreateClientInput {
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
}

export class CreateClientUsecase {
  constructor(private readonly repo: IClientRepository) {}

  async execute({ name, email, status }: CreateClientInput): Promise<void> {
    return this.repo.save({
      name,
      email,
      status
    });
  }
}
