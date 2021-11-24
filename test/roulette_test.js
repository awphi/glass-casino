const ethers = require("ethers");
const Roulette = artifacts.require("Roulette");

contract("Roulette", function (accounts) {
  beforeEach(async function () {
    this.roulette = await Roulette.deployed();
  });

  it("should initially be no bets", async function () {
    const bets = await this.roulette.get_bets.call();
    return assert.equal(bets.length, 0);
  });

  it("should pay 2x on correct colour bets", async function () {
    const betValue = ethers.utils.parseEther("0.01");
    const bet = [accounts[2], Roulette.BetType.COLOUR, 0, betValue];

    // 0 = bet red, 1 is red
    const winnings = await this.roulette.get_winnings.call(bet, 1);
    return winnings == betValue * 2;
  });

  it("should pay 2x on correct odd/even bets", async function () {
    const betValue = ethers.utils.parseEther("0.01");
    const bet = [accounts[2], Roulette.BetType.ODDEVEN, 0, betValue];

    // 0 = bet red, 1 is red
    const winnings = await this.roulette.get_winnings.call(bet, 16);
    return winnings == betValue * 2;
  });

  it("should pay 35x on correct straightup bets", async function () {
    const betValue = ethers.utils.parseEther("0.01");
    const bet = [accounts[2], Roulette.BetType.STRAIGHTUP, 12, betValue];

    // 0 = bet red, 1 is red
    const winnings = await this.roulette.get_winnings.call(bet, 12);
    return winnings == betValue * 35;
  });

  it("should pay 0x on losing bets", async function () {
    const betValue = ethers.utils.parseEther("0.01");
    const bet = [accounts[2], Roulette.BetType.COLOUR, 0, betValue];

    // 0 = bet red, 1 is red
    const winnings = await this.roulette.get_winnings.call(bet, 2);
    return winnings == 0;
  });

  it("should pay 0x on house-edge rolls (0 green)", async function () {
    const betValue = ethers.utils.parseEther("0.01");
    const bet = [accounts[2], Roulette.BetType.STRAIGHTUP, 12, betValue];

    // 0 = bet red, 1 is red
    const winnings = await this.roulette.get_winnings.call(bet, 0);
    return winnings == 0;
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
});
