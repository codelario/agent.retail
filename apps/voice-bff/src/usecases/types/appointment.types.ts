export interface IAppointment {
  id: string
  patient_id: string
  slot_id: string
  location_id: string
  status: 'scheduled' | 'cancelled' | 'completed'
}
