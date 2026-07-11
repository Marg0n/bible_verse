//* TypeScript declaration file for using process.env
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    JWT_REFRESH_SECRET: string;
    JWT_SECRET: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    BASE_URL: string;
    ALLOWED_ORIGINS: string;
    NODE_ENV: 'development' | 'production' | 'test';
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: number;
    POSTGRES_DB: string;
  }
}
