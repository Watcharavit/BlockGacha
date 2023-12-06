# BlockGacha


## Running the Project Locally

### Prerequisites

-   Node.js installed on your system.
-   A `.env` file in the root directory with configurations. Use `.env.example` as a template.

### Installation and Setup

1. **Install Dependencies**: In the root directory, run:

    ```bash
    npm install
    ```

2. **Environment Configuration**:

    - For **compiling smart contracts**, set `API_URL` in your `.env` file to your network RPC URL.
        ```env
        API_URL=https://rpc.sepolia.org  # Example for Sepolia network
        ```
    - For **deploying contracts**, add `API_URL` and your wallet's private key to the `.env` file:
        ```env
        PRIVATE_KEY=your_wallet_private_key
        ```
    - If you are **running scripts** that interact with deployed contracts, add both `API_URL`, `PRIVATE_KEY` and specify the contract address:
        ```env
        CONTRACT_ADDRESS=deployed_contract_address
        ```
        
**(For Advanced Topics in Computer Engineering V Lecture: only set `API_URL` since we will be deploying contract using Remix on a real network or testnet and obtain the contract address.)**

3. **Compile Smart Contracts**:

    - To compile, run:
        ```bash
        npx hardhat compile
        ```
    - If there are changes in the smart contract code, first run `npx hardhat clean` to clear the cache and avoid potential errors.

4. **Deploying Contracts** (For Advanced Topics in Computer Engineering V Lecture deploy it using Remix as mentioned above):

    - To deploy, run:
        ```bash
        npx hardhat run --network [your-choice-of-network] deploy.js
        ```

5. **Server Setup**:
    - Navigate to the `server` directory and install dependencies:
        ```bash
        cd server
        npm install
        ```
    - Set up the `server` `.env` file according to `server/.env.example`:
        ```env
        PORT=your_port_number
        NODE_ENV=production
        MONGO_URI=your_mongoDB_URI
        JWT_SECRET=your_jwt_secret
        JWT_EXPIRE=365d
        JWT_COOKIE_EXPIRE=365
        API_URL=your_network_RPC_URL
        PRIVATE_KEY=your_private_key
        CONTRACT_ADDRESS=deployed_contract_address
        ```

## Running with Docker

### Using the Docker Image

If you prefer to use Docker instead of running the project locally:

1. **Pull the Docker Image**:

    ```bash
    # Command to pull the image
    docker pull watcharavit/block-gacha:1.0
    ```

2. **Run the Docker Container**:

    - Map the desired port and set the required environment variables:

        ```bash
        docker run -p <your_port>:5000 \
        -e MONGO_URI=your_mongoDB_URI \
        -e JWT_SECRET=your_jwt_secret \
        -e API_URL=your_network_RPC_URL \
        -e PRIVATE_KEY=your_private_key \
        -e CONTRACT_ADDRESS=deployed_contract_address \
        watcharavit/block-gacha:1.0
        ```

    - Replace `<your_port>` with the port you want to use.

This guide should help you get the project up and running smoothly, whether you choose to run it locally or in a Docker container.
