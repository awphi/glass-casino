const ChuckALuck = artifacts.require("ChuckALuck");

module.exports = function (deployer) {
  deployer.deploy(ChuckALuck);
};
