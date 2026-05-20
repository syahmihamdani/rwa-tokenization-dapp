import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Property Token
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const token = await PropertyToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("PropertyToken deployed to:", tokenAddress);

  // 2. Deploy Property DAO
  const PropertyDAO = await hre.ethers.getContractFactory("PropertyDAO");
  const dao = await PropertyDAO.deploy(tokenAddress);
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("PropertyDAO deployed to:", daoAddress);

  // 3. Deploy Property Registry
  const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
  const registry = await PropertyRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("PropertyRegistry deployed to:", registryAddress);

  // 4. Deploy Dividend Distributor
  const DividendDistributor = await hre.ethers.getContractFactory("DividendDistributor");
  const distributor = await DividendDistributor.deploy(tokenAddress);
  await distributor.waitForDeployment();
  const distributorAddress = await distributor.getAddress();
  console.log("DividendDistributor deployed to:", distributorAddress);

  // --- WRITE FRONTEND CONFIG ---
  const frontendConfigPath = path.join(__dirname, "../../frontend/src/config.json");

  const config = {
    PropertyToken: tokenAddress,
    PropertyDAO: daoAddress,
    PropertyRegistry: registryAddress,
    DividendDistributor: distributorAddress
  };

  try {
    fs.mkdirSync(path.join(__dirname, "../../frontend/src"), { recursive: true });
    fs.writeFileSync(frontendConfigPath, JSON.stringify(config, null, 2));
    console.log("Wrote contract addresses to frontend/src/config.json");
  } catch (e) {
    console.error("Could not write to frontend config", e);
  }

  // --- SEEDING DATA FOR DEMO ---
  const isLocalNetwork = hre.network.name === "hardhat" || hre.network.name === "localhost";

  if (isLocalNetwork && user1 && user2) {
    console.log("\n--- Seeding Demo Data (Local) ---");
    await registry.registerProperty(
      "Jl. ABC 123",
      "$1,000,000",
      "ipfs://QmDummyLegalDocCID12345"
    );
    console.log("Registered dummy property.");

    const amountToUser1 = hre.ethers.parseEther("100000");
    const amountToUser2 = hre.ethers.parseEther("50000");

    await token.transfer(user1.address, amountToUser1);
    await token.transfer(user2.address, amountToUser2);
    console.log(`Transferred 100k tokens to ${user1.address} and 50k to ${user2.address}`);

    await token.connect(user1).delegate(user1.address);
    await token.connect(user2).delegate(user2.address);
    await token.connect(deployer).delegate(deployer.address);
    console.log("Delegated voting power.");

    const rentAmount = hre.ethers.parseEther("10.0");
    await distributor.payRent({ value: rentAmount });
    console.log("Paid 10 ETH rent into DividendDistributor.");
  } else {
    console.log("\n--- Live Network / Single Signer Setup ---");
    // On a live network, we delegate voting power to the deployer so they can test DAO voting
    try {
      console.log("Delegating voting power to deployer...");
      const tx = await token.delegate(deployer.address);
      await tx.wait();
      console.log("Successfully delegated voting power to deployer.");
    } catch (e) {
      console.warn("Could not delegate voting power to deployer:", e.message);
    }
  }

  console.log("\nDeployment & Configuration Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
