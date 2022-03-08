const { ethers } = require("ethers");

class RouletteScheduler {
  constructor(contract, broadcast, interval, delay = 1000) {
    this.nextRoll = 0;
    this.contract = contract;
    this.broadcast = broadcast;
    this.nextRoll = Date.now();
    this.rollPending = false;

    this.interval = interval;
    this.delay = delay;

    this.contract.on(this.contract.filters.BetPlaced(), async (_, c) => {
      const tx = await c.getTransaction();
      try {
        // Await transaction confirmation before scheduling a roll
        await tx.wait();
        this.scheduleNextRoll();
      } catch (e) {
        console.error(e);
      }
    });
  }

  async roll() {
    const nBets = await this.contract.numBets().catch(console.error);

    var before = Date.now();

    console.log(`Rolling with ${nBets} bets`);
    if (nBets > 0) {
      const tx = await this.contract.play({ gasLimit: nBets * 150000 });
      // Waits for the spin to be confirmed
      await tx.wait();
    }

    console.log(`Completed roll! Took ${(Date.now() - before) / 1000} seconds to confirm`);
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
    if (this.rollPending) {
      return;
    }

    this.rollPending = true;

    setTimeout(() => {
      this.nextRoll = Date.now() + this.interval;
      console.log(`Next roll scheduled for: ${this.nextRoll}`);
      this.broadcast(this.data());
      setTimeout(() => {
        this.roll(this.contract);
      }, this.interval);
    }, this.delay);
  }
}

module.exports = RouletteScheduler;
