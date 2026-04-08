import { z } from 'zod';

const clientSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    status: z.enum(['active', 'inactive', 'pending']),
});

const clientsArraySchema = z.array(clientSchema);

export { clientSchema, clientsArraySchema };
export type IClient = z.infer<typeof clientSchema>;