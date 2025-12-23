import { z } from 'zod';

export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Tenant name is required'),
  isActive: z.boolean().default(true),
});

export type Tenant = z.infer<typeof tenantSchema>;
