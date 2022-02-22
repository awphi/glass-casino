const CentralBank = artifacts.require("CentralBank");

module.exports = async function (deployer, network, accounts) {
  // Don't renounce if dev network
  if (network === "mumbai" || network === "development") {
    console.log(`Skipping ADMIN renunciation step due to network: ${network}`);
    return;
  }

  const bank = await CentralBank.deployed();
  console.log(bank);
  await bank.renounceRole(await bank.ADMIN(), accounts[0], {
    from: accounts[0],
  });
  console.log(`Renounced adminship of ${accounts[0]} from CentralBank @ ${bank.address}!`);
};
