export const bookAppointmentSchema = {
  type: 'object',
  required: ['patient_id', 'slot_id', 'location_id'],
  properties: {
    patient_id:  { type: 'string', minLength: 1 },
    slot_id:     { type: 'string', minLength: 1 },
    location_id: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;
