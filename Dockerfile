# Stage 1: Build and compile smart contracts
FROM node:18 as builder

# Set the working directory for the build stage
WORKDIR /usr/src/hardhat

# Copy the necessary files for compiling contracts
COPY package*.json hardhat.config.js ./
COPY contracts ./contracts

# Install dependencies and compile contracts
RUN npm install && npx hardhat compile

# Stage 2: Setup server runtime environment
FROM node:18 as runtime

# Set the working directory for the server
WORKDIR /usr/src/app

# Copy the compiled artifacts from the builder stage
COPY --from=builder /usr/src/hardhat/artifacts ./artifacts

# Copy the server files into a server directory in the container
COPY server/ ./server

# Install production dependencies only
WORKDIR /usr/src/app/server
RUN npm install --only=production

# Expose the port your app runs on
EXPOSE 5000

ENV PORT="5000"
ENV NODE_ENV="production"
ENV MONGO_URI=""
ENV JWT_SECRET="JWT_SECRET"
ENV JWT_EXPIRE="365d"
ENV JWT_COOKIE_EXPIRE="365"
ENV API_URL=""
ENV PRIVATE_KEY=""
ENV CONTRACT_ADDRESS=""

# Command to start the server
CMD [ "node", "server.js" ]

