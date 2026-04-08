import type { IVoiceRepository } from './types/IVoiceRepository';
import type { IPatient } from './types/patient.types';

export interface LookupPatientInput {
  first_name: string
  last_name: string
  dob: string
}

export class LookupPatientUsecase {
  constructor(private readonly repo: IVoiceRepository) {}

  async execute({ first_name, last_name, dob }: LookupPatientInput): Promise<IPatient | null> {
    return this.repo.lookupPatient(first_name, last_name, dob);
  }
}
