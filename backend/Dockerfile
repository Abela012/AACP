# ─── Stage 1: Build ───
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the project (compiles TS to JS in /dist)
RUN npm run build

# ─── Stage 2: Production ───
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist
# Copy any other necessary files (like .env example or config)
# COPY .env .env

# Expose port
EXPOSE 5000

# Run the compiled code
CMD ["npm", "start"]
