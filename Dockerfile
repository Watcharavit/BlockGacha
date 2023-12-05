# Stage 1: Build and compile smart contracts
FROM node:18 as builder

WORKDIR /usr/src/hardhat
COPY package*.json hardhat.config.js ./
COPY contracts ./contracts
RUN npm install && npx hardhat compile

# Stage 2: Setup server runtime environment
FROM node:18 as runtime

WORKDIR /usr/src/app
COPY --from=builder /usr/src/hardhat/artifacts ./artifacts
COPY server/ ./server

WORKDIR /usr/src/app/server
RUN npm install --only=production

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

CMD [ "node", "server.js" ]