const { ethers } = require("ethers");

class RouletteScheduler {
  constructor(contract, broadcast, interval, delay) {
    this.nextRoll = 0;
    this.contract = contract;
    this.broadcast = broadcast;
    this.nextRoll = Date.now();
    this.rollPending = false;

    this.interval = isNaN(interval) ? 10000 : Number(interval);
    this.delay = isNaN(delay) ? 1000 : Number(delay);

    this.contract.on(this.contract.filters["BetPlaced"](), () => {
      if (this.rollPending) {
        return;
      }

      this.rollPending = true;
      setTimeout(() => {
        this.scheduleNextRoll(this.contract);
      }, this.delay);
    });
  }

  async roll() {
    const len = await this.contract.get_bets_length().catch(console.error);

    var before = Date.now();

    console.log(`Rolling with ${len} bets`);
    if (len > 0) {
      const tx = await this.contract.play();
      // Waits for the spin to be confirmed
      await tx.wait();
    }

    console.log(
      `Completed roll! Took ${(Date.now() - before) / 1000} seconds to confirm`
    );
    this.rollPending = false;
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
