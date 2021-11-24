const { ethers } = require("ethers");
const rouletteJson = require("../build/contracts/Roulette.json");

const provider = new ethers.providers.JsonRpcProvider(`http://localhost:7545`);
provider.pollingInterval = 1000;
const signer = provider.getSigner();

const interval = 10000;
var nextRoll = 0;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function roll(contract) {
  const bets = await contract.get_bets().catch(console.error);

  var before = Date.now();
  log(`Rolling with ${bets.length} bets`);
  if (bets.length > 0) {
    // Waits for the spin to actually go onto the chain
    const tx = await contract.play();
    await tx.wait();
  }

  log(`Roll took ${(Date.now() - before) / 1000} seconds`);
  scheduleNextRoll(contract);
}

function scheduleNextRoll(contract) {
  nextRoll = Date.now() + interval;
  // TODO: Send our ws message out to clients here
  setTimeout(() => {
    roll(contract);
  }, interval);
}

provider.getNetwork().then((network) => {
  const Roulette = new ethers.Contract(
    rouletteJson.networks[network.chainId].address,
    rouletteJson.abi,
    provider
  ).connect(signer);

  nextRoll = Date.now();
  roll(Roulette);

  Roulette.on(Roulette.filters["OutcomeDecided"](), async (roll, data) => {
    console.log(`Last roll: ${roll}`);
  });
});
