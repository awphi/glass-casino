const CentralBank = artifacts.require("CentralBank");
const Roulette = artifacts.require("Roulette");

module.exports = async function (deployer) {
  const bank = await CentralBank.deployed();
  await deployer.deploy(Roulette, bank.address);
};
