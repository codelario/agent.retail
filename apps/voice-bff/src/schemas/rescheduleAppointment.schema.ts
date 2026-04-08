export const rescheduleAppointmentSchema = {
  type: 'object',
  required: ['new_slot_id'],
  properties: {
    new_slot_id: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;
