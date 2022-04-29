require("dotenv").config();
require("log-timestamp");
const ARGS = process.argv.slice(2);

const { ethers } = require("ethers");
const { WebSocketServer, WebSocket } = require("ws");

const wss = new WebSocketServer({
  port: 8090,
});

function heartbeat() {
  this.isAlive = true;
}

// Setup WSS
wss.on("connection", function connection(ws) {
  // Establish heartbeat
  ws.isAlive = true;
  ws.on("pong", heartbeat);

  if (roulette && roulette.rollPending) {
    ws.send(roulette.data());
  }
});

function broadcast(data) {
  console.log(`Broadcasing data to ${wss.clients.length} clients!`);
  wss.clients.forEach((client) => {
    console.log(client.readyState);
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Set up heartbeast interval
const heartbeatInterval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 10000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

var roulette;

// If dev use secret local dev key, else use public, protected key
const alchemyApi = ARGS.includes("--dev")
  ? process.env.ALCHEMY_API_ENDPOINT_DEV
  : "https://polygon-mumbai.g.alchemy.com/v2/KefZ5j5KdtKEnWEdbOGjqmhdcSNaxHdf";

const provider = new ethers.providers.StaticJsonRpcProvider(alchemyApi);
provider.pollingInterval = 1000;

const signer = ethers.Wallet.fromMnemonic(process.env.MNEMONIC.trim()).connect(provider);

// Roulette
const rouletteJson = require(`.${ARGS.includes("--dev") ? "./build" : ""}/contracts/Roulette.json`);
const RouletteScheduler = require("./roulette-scheduler.js");
provider
  .getNetwork()
  .then((network) => {
    const contract = new ethers.Contract(
      rouletteJson.networks[network.chainId].address,
      rouletteJson.abi,
      provider
    ).connect(signer);

    roulette = new RouletteScheduler(contract, broadcast, ARGS.includes("--dev") ? 15000 : 45000);
  })
  .catch(console.error);
