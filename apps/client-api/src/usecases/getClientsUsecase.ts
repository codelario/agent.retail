import type { Client, IClientRepository } from './types/IClientRepository';

interface GetClientsInput {
  status?: string;
}

export class GetClientsUsecase {
  constructor(private readonly repo: IClientRepository) {}

  async execute({ status }: GetClientsInput): Promise<Client[]> {
    if (status) {
      return this.repo.findByStatus(status);
    }
    return this.repo.findAll();
  }
}
