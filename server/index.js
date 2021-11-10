const { ethers } = require("ethers");
const rouletteJson = require("../build/contracts/Roulette.json");
require("dotenv").config();

const NETWORK = "5777";

const provider = new ethers.providers.JsonRpcProvider(`http:/\/localhost:7545`);
const signer = provider.getSigner();

const Roulette = new ethers.Contract(
  rouletteJson.networks[NETWORK].address,
  rouletteJson.abi,
  provider
).connect(signer);

setInterval(async () => {
  const bets = await Roulette.get_bets();
  if (bets.length > 0) {
    console.log(`Playing with ${bets.length} bets!`);
    Roulette.play();
  } else {
    console.log("No bets!");
  }
}, 10000);

Roulette.on(Roulette.filters["OutcomeDecided"](), async (roll, data) => {
  console.log(`Last roll: ${roll}`);
});
