const CentralBank = artifacts.require("CentralBank");
const Roulette = artifacts.require("Roulette");

module.exports = async function (deployer) {
  const bank = await CentralBank.deployed();
  const game = await deployer.deploy(Roulette, bank.address);

  await bank.grantRole(await bank.OPERATOR(), game.address);
};
