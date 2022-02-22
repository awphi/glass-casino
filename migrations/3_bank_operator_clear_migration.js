const CentralBank = artifacts.require("CentralBank");

module.exports = async function (deployer, network, accounts) {
  // If we're on a dev/test network, clear out old operators
  if (network === "mumbai" || network === "development") {
    const bank = await CentralBank.deployed();
    await bank.revokeRoleAll(await bank.OPERATOR(), { from: accounts[0] });
    console.log(`Revoked all old operatorships from CentralBank @ ${bank.address}!`);
  } else {
    console.log(`Skipping operator clearing migration due to network: ${network}`);
  }
};
