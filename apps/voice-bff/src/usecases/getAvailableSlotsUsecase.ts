import type { IVoiceRepository } from './types/IVoiceRepository';
import type { ISlot } from './types/slot.types';

export class GetAvailableSlotsUsecase {
  constructor(private readonly repo: IVoiceRepository) {}

  async execute(locationId: string, date?: string): Promise<ISlot[]> {
    return this.repo.getAvailableSlots(locationId, date);
  }
}
