export const lookupPatientSchema = {
  type: 'object',
  required: ['first_name', 'last_name', 'dob'],
  properties: {
    first_name: { type: 'string', minLength: 1, maxLength: 100 },
    last_name:  { type: 'string', minLength: 1, maxLength: 100 },
    dob:        { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' }, // MM-DD-YYYY
  },
  additionalProperties: false,
} as const;
