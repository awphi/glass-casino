require("dotenv").config();
require("log-timestamp");
const ARGS = process.argv.slice(2);

const { ethers } = require("ethers");
const { WebSocketServer, WebSocket } = require("ws");

const wss = new WebSocketServer({
  port: process.env.PORT ? Number(process.env.PORT) : 8090,
});

var roulette;

// Setup WSS
wss.on("connection", function connection(ws) {
  if (roulette && roulette.rollPending) {
    ws.send(roulette.data());
  }
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Ethers.js provider
const rpc = ARGS.includes("--dev")
  ? process.env.MUMBAI_URL.trim()
  : process.env.MAINNET_URL.trim();

const provider = new ethers.getDefaultProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/KefZ5j5KdtKEnWEdbOGjqmhdcSNaxHdf"
);
provider.pollingInterval = process.env.POLLING_INTERVAL
  ? Number(process.env.POLLING_INTERVAL)
  : 1000;

const signer = ethers.Wallet.fromMnemonic(process.env.MNEMONIC.trim()).connect(
  provider
);

// Roulette
const rouletteJson = require(`.${
  ARGS.includes("--dev") ? "./build" : ""
}/contracts/Roulette.json`);
const RouletteScheduler = require("./roulette-scheduler.js");
provider
  .getNetwork()
  .then((network) => {
    const contract = new ethers.Contract(
      rouletteJson.networks[network.chainId].address,
      rouletteJson.abi,
      provider
    ).connect(signer);

    roulette = new RouletteScheduler(
      contract,
      broadcast,
      process.env.ROULETTE_INTERVAL,
      process.env.ROULETTE_ROLL_DELAY
    );
    roulette.scheduleNextRoll();
  })
  .catch(console.error);
