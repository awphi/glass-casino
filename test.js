const { ethers } = require("ethers");
const rouletteJson = require("./build/contracts/Roulette.json");

const c = new ethers.Contract(
  "0xa6a61C6025a96794C749B10CE3A33936634DBc45",
  rouletteJson.abi
);

const f = c.filters.OutcomeDecided();
console.log(f);
c.queryFilter(f, 23864656 - 100000, 23864656);

new ethers.providers.JsonRpcProvider().getBlockNumber;
