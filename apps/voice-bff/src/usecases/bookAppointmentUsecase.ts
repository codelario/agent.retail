import type { IVoiceRepository } from './types/IVoiceRepository';
import type { IAppointment } from './types/appointment.types';

export interface BookAppointmentInput {
  patient_id: string
  slot_id: string
  location_id: string
}

export class BookAppointmentUsecase {
  constructor(private readonly repo: IVoiceRepository) {}

  async execute({ patient_id, slot_id, location_id }: BookAppointmentInput): Promise<IAppointment> {
    return this.repo.bookAppointment(patient_id, slot_id, location_id);
  }
}
