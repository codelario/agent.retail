import type { ISlot } from './slot.types';
import type { IPatient } from './patient.types';
import type { IAppointment } from './appointment.types';

export interface IVoiceRepository {
  // Slots
  getAvailableSlots(locationId: string, date?: string): Promise<ISlot[]>
  // Patients
  lookupPatient(firstName: string, lastName: string, dob: string): Promise<IPatient | null>
  // Appointments
  bookAppointment(patientId: string, slotId: string, locationId: string): Promise<IAppointment>
  cancelAppointment(appointmentId: string): Promise<void>
  rescheduleAppointment(appointmentId: string, newSlotId: string): Promise<IAppointment>
}
