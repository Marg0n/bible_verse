import { registerAs } from '@nestjs/config';

//? Only application-level settings.
export default registerAs('app', () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  baseUrl: process.env.BASE_URL,
  allowedOrigins:
    process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) ??
    [],
}));
