import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000), //? coerce.number() turns string to number like '3000' to 3000

  NODE_ENV: z.enum(['development', 'production', 'test']),

  BASE_URL: z.url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1),

  POSTGRES_USER: z.string(),

  POSTGRES_PASSWORD: z.string(),

  POSTGRES_DB: z.string(),

  JWT_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  REDIS_URL: z.url().default('redis://localhost:6379'),

  ALLOWED_ORIGINS: z.string(),
});

export function validate(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
