const CentralBank = artifacts.require("CentralBank");

module.exports = function (deployer) {
  deployer.deploy(CentralBank);
};
