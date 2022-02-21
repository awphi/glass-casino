const ChuckALuck = artifacts.require("ChuckALuck");
const chainLinkData = require("./chainlink_data.json");

module.exports = function (deployer) {
  if (!(deployer.network_id in chainLinkData)) {
    throw Error(
      `No chainlink details found for network ID: ${deployer.network_id}`
    );
  }

  const data = chainLinkData[deployer.network_id];

  deployer.deploy(
    ChuckALuck,
    data.vrfCoordinator,
    data.token,
    data.keyHash,
    data.fee
  );
};
