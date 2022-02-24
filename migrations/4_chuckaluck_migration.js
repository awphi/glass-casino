const CentralBank = artifacts.require("CentralBank");
const ChuckALuck = artifacts.require("ChuckALuck");
const chainLinkData = require("./chainlink_data.json");

module.exports = async function (deployer) {
  if (!(deployer.network_id in chainLinkData)) {
    throw Error(`No chainlink details found for network ID: ${deployer.network_id}`);
  }

  const data = chainLinkData[deployer.network_id];
  const bank = await CentralBank.deployed();
  const game = await deployer.deploy(ChuckALuck, data.vrfCoordinator, data.token, data.keyHash, data.fee, bank.address);

  await bank.grantRole(await bank.OPERATOR(), game.address);
};
