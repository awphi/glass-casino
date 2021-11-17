const { ethers } = require("ethers");
const rouletteJson = require("../build/contracts/Roulette.json");

const provider = new ethers.providers.JsonRpcProvider(`http:/\/localhost:7545`);
provider.pollingInterval = 1000;
const signer = provider.getSigner();

provider.getNetwork().then((network) => {
  const Roulette = new ethers.Contract(
    rouletteJson.networks[network.chainId].address,
    rouletteJson.abi,
    provider
  ).connect(signer);

  setInterval(async () => {
    const bets = await Roulette.get_bets().catch(console.error);
    if (bets.length >= 0) {
      console.log(`Playing with ${bets.length} bets!`);
      Roulette.play();
    } else {
      console.log("No bets!");
    }
  }, 10000);

  Roulette.on(Roulette.filters["OutcomeDecided"](), async (roll, data) => {
    console.log(`Last roll: ${roll}`);
  });
});
