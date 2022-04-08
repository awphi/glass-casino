const { ethers } = require("ethers");
const dotenv = require("dotenv");
const fs = require("fs").promises;

const chainId = 80001;

const contractJson = require("../../build/contracts/Roulette.json");
const method = "place_bet";
const operands = [0, 1, 0];

dotenv.config();

const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC.trim());
const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC.trim()).connect(provider);
const contract = new ethers.Contract(contractJson.networks[chainId].address, contractJson.abi, wallet);

// Records in ms
function measureASyncTx(contract, method, operands) {
  const start = Date.now();

  return contract[method](...operands)
    .then((t) => t.wait())
    .then(() => {
      const end = Date.now();
      const elapsed = end - start;
      return elapsed;
    });
}

async function main(runCount) {
  const results = [];
  for (var i = 0; i < runCount; i++) {
    try {
      const r = await measureASyncTx(contract, method, operands);
      console.log(`${i + 1} / ${runCount} -> ${r / 1000}s`);
      results.push(r);
    } catch (e) {
      i -= 1;
    }
  }

  await fs.writeFile(
    `${contractJson.contractName}.${method}.json`,
    JSON.stringify({
      contract: contractJson.contractName,
      method: method,
      operands: operands,
      runs: runCount,
      results: results,
    })
  );
}

main(100);
