const Roulette = artifacts.require("Roulette");

module.exports = function (deployer) {
  const d = deployer.deploy(Roulette);
  d.chain.then((d) => console.log("Deployed roulette to: " + d.address));
};