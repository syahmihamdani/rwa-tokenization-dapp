import hre from "hardhat";

async function main() {
  const blocksToMine = 60; // Lebih dari voting period (50 blocks)
  console.log(`Mining ${blocksToMine} blocks to fast-forward the DAO voting period...`);
  
  await hre.network.provider.send("hardhat_mine", [`0x${blocksToMine.toString(16)}`]);
  
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  console.log(`Successfully mined ${blocksToMine} blocks!`);
  console.log(`Current block number: ${blockNumber}`);
  console.log("Your active proposals should now be completed (Succeeded or Defeated).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
