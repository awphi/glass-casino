const CentralBank = artifacts.require("CentralBank");

module.exports = async function (deployer, network, accounts) {
  // If we're on a dev/test network, clear out old operators
  if (network === "mumbai" || network === "development") {
    const bank = await CentralBank.deployed();

    const operator = await bank.OPERATOR();
    const count = await bank.getRoleMemberCount(operator);

    const promises = [];
    for (var i = 0; i < count; i++) {
      const p = bank.getRoleMember(operator, i).then((address) => {
        return bank.revokeRole(operator, address, { from: accounts[0] });
      });
      promises.push(p);
    }
    await Promise.all(promises);

    console.log(`Revoked all old operatorships from CentralBank @ ${bank.address}!`);
  } else {
    console.log(`Skipping operator clearing migration due to network: ${network}`);
  }
};
