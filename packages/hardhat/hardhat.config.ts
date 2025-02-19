import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    corn: {
      url: process.env.CORN_RPC_URL || "https://rpc.corn-testnet.corn.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 21000001,
    },
    hardhat: {
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: {
      corn: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "corn",
        chainId: 21000001,
        urls: {
          apiURL: "https://explorer-corn-testnet-l8rm17uloq.t.conduit.xyz/api",
          browserURL: "https://explorer-corn-testnet-l8rm17uloq.t.conduit.xyz"
        }
      }
    ]
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;