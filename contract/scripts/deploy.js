// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require("hardhat");

async function main() {
  const RestakingFarm = await ethers.getContractFactory("RestakingFarm");
  const restakingFarm = await upgrades.deployProxy(
    RestakingFarm,
    ["0xe8Dc4b1b8d2475A7b5c6D03A0f0523E4DbBAC4D2", 4000000000],
    {
      kind: "uups",
    }
  );
  await restakingFarm.deployed();

  console.log("RestakingFarm deployed to: ", restakingFarm.address);
}

// async function main() {
//   const CustomTokenUpgradable = await ethers.getContractFactory(
//     "CustomTokenUpgradable"
//   );
//   const customTokenUpgradable = await upgrades.deployProxy(
//     CustomTokenUpgradable,
//     [
//       "0xc3aC498cdFb6E1dCfA17cBC55e514560f26A1922",
//       "0xc3aC498cdFb6E1dCfA17cBC55e514560f26A1922",
//       10,
//       5,
//       5,
//     ],
//     {
//       kind: "uups",
//     }
//   );
//   await customTokenUpgradable.deployed();

//   console.log(
//     "CustomTokenUpgradable deployed to: ",
//     customTokenUpgradable.address
//   );
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
