import type { IVoiceRepository } from '../usecases/types/IVoiceRepository';
import type { ISlot } from '../usecases/types/slot.types';
import type { IPatient } from '../usecases/types/patient.types';
import type { IAppointment } from '../usecases/types/appointment.types';

const MOCK_PATIENTS: IPatient[] = [
  { id: 'p-1', first_name: 'Ana',     last_name: 'García',   dob: '03-15-1990', phone: '555-0101' },
  { id: 'p-2', first_name: 'Bruno',   last_name: 'López',    dob: '07-22-1985', phone: '555-0102' },
  { id: 'p-3', first_name: 'Carla',   last_name: 'Méndez',   dob: '11-30-1978', phone: '555-0103' },
  { id: 'p-4', first_name: 'Diego',   last_name: 'Torres',   dob: '01-08-2000', phone: '555-0104' },
  { id: 'p-5', first_name: 'Elena',   last_name: 'Ramírez',  dob: '09-14-1993', phone: '555-0105' },
];

const MOCK_SLOTS: ISlot[] = [
  { id: 's-1',  location_id: 'loc-1', provider: 'Dr. Smith',   date: '2026-04-10', time: '09:00', available: true  },
  { id: 's-2',  location_id: 'loc-1', provider: 'Dr. Smith',   date: '2026-04-10', time: '10:00', available: true  },
  { id: 's-3',  location_id: 'loc-1', provider: 'Dr. Jones',   date: '2026-04-10', time: '11:00', available: false },
  { id: 's-4',  location_id: 'loc-1', provider: 'Dr. Jones',   date: '2026-04-11', time: '09:30', available: true  },
  { id: 's-5',  location_id: 'loc-2', provider: 'Dr. Patel',   date: '2026-04-10', time: '14:00', available: true  },
  { id: 's-6',  location_id: 'loc-2', provider: 'Dr. Patel',   date: '2026-04-10', time: '15:00', available: true  },
  { id: 's-7',  location_id: 'loc-2', provider: 'Dr. Chen',    date: '2026-04-11', time: '10:00', available: true  },
  { id: 's-8',  location_id: 'loc-3', provider: 'Dr. Rivera',  date: '2026-04-10', time: '08:00', available: false },
  { id: 's-9',  location_id: 'loc-3', provider: 'Dr. Rivera',  date: '2026-04-11', time: '08:00', available: true  },
  { id: 's-10', location_id: 'loc-3', provider: 'Dr. Kim',     date: '2026-04-11', time: '16:00', available: true  },
];

// Mutable state simulating a DB (resets on cold start)
const APPOINTMENTS: IAppointment[] = [];
let nextAppointmentId = 1;

export class InMemoryVoiceRepository implements IVoiceRepository {
  async getAvailableSlots(locationId: string, date?: string): Promise<ISlot[]> {
    return MOCK_SLOTS.filter(slot => {
      const matchesLocation = slot.location_id === locationId;
      const matchesDate = date ? slot.date === date : true;
      return matchesLocation && matchesDate && slot.available;
    });
  }

  async lookupPatient(firstName: string, lastName: string, dob: string): Promise<IPatient | null> {
    const normalize = (s: string) => s.trim().toLowerCase();
    return MOCK_PATIENTS.find(
      p =>
        normalize(p.first_name) === normalize(firstName) &&
        normalize(p.last_name)  === normalize(lastName)  &&
        p.dob === dob,
    ) ?? null;
  }

  async bookAppointment(patientId: string, slotId: string, locationId: string): Promise<IAppointment> {
    const slot = MOCK_SLOTS.find(s => s.id === slotId);
    if (!slot) throw new Error(`Slot ${slotId} not found`);
    if (!slot.available) throw new Error(`Slot ${slotId} is not available`);

    slot.available = false;

    const appointment: IAppointment = {
      id: `appt-${nextAppointmentId++}`,
      patient_id: patientId,
      slot_id: slotId,
      location_id: locationId,
      status: 'scheduled',
    };
    APPOINTMENTS.push(appointment);
    return appointment;
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const appt = APPOINTMENTS.find(a => a.id === appointmentId);
    if (!appt) throw new Error(`Appointment ${appointmentId} not found`);

    appt.status = 'cancelled';

    // Re-open the slot
    const slot = MOCK_SLOTS.find(s => s.id === appt.slot_id);
    if (slot) slot.available = true;
  }

  async rescheduleAppointment(appointmentId: string, newSlotId: string): Promise<IAppointment> {
    const appt = APPOINTMENTS.find(a => a.id === appointmentId);
    if (!appt) throw new Error(`Appointment ${appointmentId} not found`);

    const newSlot = MOCK_SLOTS.find(s => s.id === newSlotId);
    if (!newSlot) throw new Error(`Slot ${newSlotId} not found`);
    if (!newSlot.available) throw new Error(`Slot ${newSlotId} is not available`);

    // Re-open old slot
    const oldSlot = MOCK_SLOTS.find(s => s.id === appt.slot_id);
    if (oldSlot) oldSlot.available = true;

    newSlot.available = false;
    appt.slot_id = newSlotId;
    appt.location_id = newSlot.location_id;

    return appt;
  }
}
