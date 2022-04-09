const { ethers } = require("ethers");
const dotenv = require("dotenv");
const fs = require("fs").promises;

dotenv.config();

const chainId = 80001;
const contractJson = require("../../build/contracts/ChuckALuck.json");
const method = "play";
const operands = [6, 1];

const contractAddress = contractJson.networks[chainId].address;
const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC.trim());
const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC.trim()).connect(provider);
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

// Records in ms
function measureASyncTx(contract, method, operands) {
  const start = Date.now();

  return contract[method](...operands)
    .then((tx) => tx.wait())
    .then((tx) => {
      const end = Date.now();
      const elapsed = end - start;
      return { tx, elapsed };
    });
}

async function main(runCount) {
  const results = [];
  const vrfResults = [];
  const vrfPromises = [];

  for (var i = 0; i < runCount; i++) {
    try {
      const { tx, elapsed } = await measureASyncTx(contract, method, operands);
      const reqId = tx.events.find((e) => e.address == contractAddress && e.event == "GameStart").args.requestId;
      if (reqId) {
        vrfPromises.push(
          new Promise((resolve) => {
            const start = Date.now();
            contract.once(contract.filters.GameComplete(reqId), () => {
              vrfResults.push(Date.now() - start);
              resolve();
            });
          })
        );
      }

      console.log(`${i + 1} / ${runCount} -> ${elapsed / 1000}s`);
      results.push(elapsed);
    } catch (e) {
      console.error(e);
      i -= 1;
    }
  }

  await Promise.all(vrfPromises);

  await fs.writeFile(
    `${contractJson.contractName}.${method}.json`,
    JSON.stringify({
      contract: contractJson.contractName,
      method: method,
      operands: operands,
      runs: runCount,
      results: results,
      vrfResults: vrfResults,
    })
  );
}

main(100);
