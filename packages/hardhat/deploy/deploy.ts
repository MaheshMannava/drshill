// scripts/deploy.ts
import { network } from "hardhat";
import { ethers } from "hardhat";
import { verify } from "./helpers";
import { saveDeploymentAddresses } from "./utils";
import { Contract } from "ethers";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";

async function main() {
  console.log("Starting deployment...");

  try {
    // 1. Deploy CROPToken
    console.log("Deploying CROPToken...");
    const CROPToken = await ethers.getContractFactory("CROPToken");
    const cropToken = await CROPToken.deploy();
    await cropToken.waitForDeployment();
    const cropTokenAddress = await cropToken.getAddress();
    console.log("CROPToken deployed to:", cropTokenAddress);

    // Add after CROPToken deployment
    console.log("Waiting for CROPToken deployment confirmations...");
    await cropToken.waitForDeployment();
    
    // Add initial setup
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 2. Deploy IPFSHandler Implementation
    console.log("Deploying IPFSHandler...");
    const IPFSHandler = await ethers.getContractFactory("IPFSHandler");
    const ipfsHandler = await IPFSHandler.deploy();
    await ipfsHandler.waitForDeployment();
    const ipfsHandlerAddress = await ipfsHandler.getAddress();
    console.log("IPFSHandler deployed to:", ipfsHandlerAddress);

    // 3. Deploy CROP main contract
    console.log("Deploying CROP...");
    const CROP = await ethers.getContractFactory("CROP");
    const crop = await CROP.deploy(
      cropTokenAddress,
      ipfsHandlerAddress
    );
    await crop.waitForDeployment();
    const cropAddress = await crop.getAddress();
    console.log("CROP deployed to:", cropAddress);

    // Wait for block confirmations
    console.log("Waiting for block confirmations...");

    // Verify contracts if on testnet
    if (network.name === "corntest") {
      console.log("Verifying contracts...");
      
      await verify(cropTokenAddress, []);
      await verify(ipfsHandlerAddress, []);
      await verify(cropAddress, [cropTokenAddress, ipfsHandlerAddress]);
    }

    // Add post-deployment setup
    if (network.name !== "hardhat") {
      console.log("Setting up initial state...");
      // Optional: Add any post-deployment configuration here
    }

    // Add deployment verification
    console.log("Verifying deployment addresses...");
    if (!cropTokenAddress || !ipfsHandlerAddress || !cropAddress) {
      throw new Error("Deployment verification failed - missing addresses");
    }

    // Save deployment addresses
    const addresses = {
      cropToken: cropTokenAddress,
      ipfsHandler: ipfsHandlerAddress,
      crop: cropAddress,
      network: network.name,
      timestamp: new Date().toISOString()
    };

    saveDeploymentAddresses(addresses);
    console.log("Deployment completed successfully!");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });