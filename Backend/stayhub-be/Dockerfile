# Backend/stayhub-be/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port (matches the port in your express app)
EXPOSE 4000

# Start in development mode (Make sure you have a "dev" script in package.json)
CMD ["npm", "run", "dev"]