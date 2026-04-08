import type { IVoiceRepository } from './types/IVoiceRepository';
import type { IAppointment } from './types/appointment.types';

export interface RescheduleAppointmentInput {
  new_slot_id: string
}

export class RescheduleAppointmentUsecase {
  constructor(private readonly repo: IVoiceRepository) {}

  async execute(appointmentId: string, newSlotId: string): Promise<IAppointment> {
    return this.repo.rescheduleAppointment(appointmentId, newSlotId);
  }
}
