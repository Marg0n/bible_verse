//* TypeScript declaration file for using process.env
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    JWT_REFRESH_SECRET: string;
    JWT_SECRET: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    BASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
