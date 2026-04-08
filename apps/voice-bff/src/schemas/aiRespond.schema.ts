export const aiRespondSchema = {
  type: 'object',
  required: ['nodeId', 'nodeName', 'prompt'],
  properties: {
    nodeId:   { type: 'string', minLength: 1 },
    nodeName: { type: 'string', minLength: 1 },
    prompt:   { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;
