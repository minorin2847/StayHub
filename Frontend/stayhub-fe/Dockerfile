# Frontend/stayhub-fe/Dockerfile
FROM node:21-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Next.js default port
EXPOSE 3000

# Start Next.js in development mode with hot reload
CMD ["npm", "run", "dev"]