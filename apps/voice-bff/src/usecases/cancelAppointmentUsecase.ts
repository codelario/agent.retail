import type { IVoiceRepository } from './types/IVoiceRepository';

export class CancelAppointmentUsecase {
  constructor(private readonly repo: IVoiceRepository) {}

  async execute(appointmentId: string): Promise<void> {
    return this.repo.cancelAppointment(appointmentId);
  }
}
