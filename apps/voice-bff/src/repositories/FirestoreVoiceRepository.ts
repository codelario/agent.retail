import type { IVoiceRepository } from '../usecases/types/IVoiceRepository';
import type { ISlot } from '../usecases/types/slot.types';
import type { IPatient } from '../usecases/types/patient.types';
import type { IAppointment } from '../usecases/types/appointment.types';

// Stub vacío — implementar en producción con Firebase Admin SDK
export class FirestoreVoiceRepository implements IVoiceRepository {
  async getAvailableSlots(_locationId: string, _date?: string): Promise<ISlot[]> {
    throw new Error('Not implemented');
  }

  async lookupPatient(_firstName: string, _lastName: string, _dob: string): Promise<IPatient | null> {
    throw new Error('Not implemented');
  }

  async bookAppointment(_patientId: string, _slotId: string, _locationId: string): Promise<IAppointment> {
    throw new Error('Not implemented');
  }

  async cancelAppointment(_appointmentId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async rescheduleAppointment(_appointmentId: string, _newSlotId: string): Promise<IAppointment> {
    throw new Error('Not implemented');
  }
}
