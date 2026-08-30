# 1. Node.js base image
FROM node:24-alpine

# 2. Application working directory
WORKDIR /app

# 3. Copy dependency files first
COPY package*.json ./

# 4. Install exact dependencies
RUN npm ci

# 5. Copy the rest of the application
COPY . .

# 6. Generate Prisma Client
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    npx prisma generate

# 7. Build NestJS
RUN npm run build

# 8. Application port
EXPOSE 3000

# 9. Start the production application
CMD ["npm", "run", "start:prod"]