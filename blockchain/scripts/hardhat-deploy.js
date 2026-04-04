const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying ImageStorage...");

  const ImageStorage = await hre.ethers.getContractFactory("ImageStorage");
  const contract = await ImageStorage.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed at:", address);

  // Save address
  fs.writeFileSync(
    path.join(__dirname, "../contractAddress.json"),
    JSON.stringify({ address }, null, 2)
  );
  console.log("✅ contractAddress.json updated!");

  // Copy ABI
  const abiSrc = path.join(
    __dirname,
    "../artifacts/contracts/ImageStorage.sol/ImageStorage.json"
  );
  const abiDst = path.join(__dirname, "../ABI/ImageStorage_ABI.json");

  if (fs.existsSync(abiSrc)) {
    fs.copyFileSync(abiSrc, abiDst);
    console.log("✅ ABI updated!");
  }
}

main().catch(console.error);