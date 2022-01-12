const { ethers } = require("ethers");

class RouletteScheduler {
  constructor(contract, broadcast, interval, delay) {
    this.nextRoll = 0;
    this.contract = contract;
    this.broadcast = broadcast;
    this.nextRoll = Date.now();

    this.interval = isNaN(interval) ? 10000 : Number(interval);
    this.delay = isNaN(delay) ? 1000 : Number(delay);
  }

  async roll() {
    const len = await this.contract.get_bets_length().catch(console.error);

    var before = Date.now();
    console.log(`Rolling with ${len} bets`);
    if (len >= 0) {
      // Waits for the spin to actually go onto the chain
      const tx = await this.contract.play();
      await tx.wait();
    }

    console.log(
      `Completed roll! Took ${(Date.now() - before) / 1000} seconds to confirm`
    );

    setTimeout(() => {
      this.scheduleNextRoll(this.contract);
    }, this.delay);
  }

  data() {
    return JSON.stringify({
      address: this.contract.address,
      data: {
        nextRoll: this.nextRoll,
      },
    });
  }

  scheduleNextRoll() {
    this.nextRoll = Date.now() + this.interval;
    console.log(`Next roll scheduled for: ${this.nextRoll}`);
    this.broadcast(this.data());
    setTimeout(() => {
      this.roll(this.contract);
    }, this.interval);
  }
}

module.exports = RouletteScheduler;
