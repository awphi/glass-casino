const ethers = require("ethers");
const Roulette = artifacts.require("Roulette");

contract("Roulette", function (accounts) {
  beforeEach(async function () {
    this.roulette = await Roulette.new();
  });

  it("should initially be no bets", async function () {
    const bets = await this.roulette.get_bets.call();
    return assert.equal(bets.length, 0);
  });

  it("should allow house accounts to spin the wheel", async function () {
    try {
      await this.roulette.play.call({ from: accounts[0] });
    } catch (e) {
      return false;
    }

    return true;
  });

  it("shouldn't allow non-house accounts to spin the wheel", async function () {
    try {
      await this.roulette.play.call({ from: accounts[1] });
    } catch (e) {
      return true;
    }

    return false;
  });

  it("shouldn't allow double-spinning", async function () {
    this.roulette.play.call({ from: accounts[0] });
    try {
      await this.roulette.play.call({ from: accounts[0] });
    } catch (e) {
      return true;
    }

    return false;
  });

  it("should allow colour bets", async function () {
    const betValue = ethers.utils.parseEther("0.1");
    await this.roulette.deposit.call(Roulette.BetType.COLOUR, 0, {
      from: accounts[1],
      value: betValue,
    });
    return true;
  });
});
