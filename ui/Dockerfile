# Use Node.js 20 as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./ 

# Install dependencies
RUN npm install

# Copy all application code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Default command to start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
