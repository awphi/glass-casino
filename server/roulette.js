class RouletteScheduler {
  constructor(contract, broadcast, interval) {
    this.nextRoll = 0;
    this.contract = contract;
    this.interval = interval;
    this.broadcast = broadcast;

    this.nextRoll = Date.now();
    this.roll();
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

    console.log(`Roll took ${(Date.now() - before) / 1000} seconds`);
    this.scheduleNextRoll(this.contract);
  }

  data() {
    return JSON.stringify({
      game: "roulette",
      address: this.contract.address,
      data: {
        nextRoll: this.nextRoll,
      },
    });
  }

  scheduleNextRoll() {
    this.nextRoll = Date.now() + this.interval;
    this.broadcast(this.data());
    setTimeout(() => {
      this.roll(this.contract);
    }, this.interval);
  }
}

module.exports = RouletteScheduler;
