export const createClientSchema = {
  type: 'object',
  required: ['name', 'email', 'status'],
  properties: {
    name:   { type: 'string', minLength: 1, maxLength: 100 },
    email:  { type: 'string', format: 'email' },
    status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
  },
  additionalProperties: false,
} as const;
