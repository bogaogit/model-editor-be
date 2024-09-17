# Stage 1: Build the application
FROM node:20 as build

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:20 as prod

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose the port that NestJS runs on (default is 3000)
EXPOSE 4000

# Start the NestJS application
CMD ["node", "dist/main"]
