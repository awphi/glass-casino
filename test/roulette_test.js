const Roulette = artifacts.require("Roulette");
contract("Roulette", function (accounts) {
  it("should initially be no bets", async function () {
    const roulette = await Roulette.deployed();
    const bets = await roulette.get_bets.call();
    return assert.equal(bets.length, 0);
  });

  it("should allow house accounts to spin the wheel", async function () {
    const roulette = await Roulette.deployed();
    try {
      await roulette.play.call({ from: accounts[0] });
    } catch (e) {
      return false;
    }

    return true;
  });

  it("shouldn't allow non-house accounts to spin the wheel", async function () {
    const roulette = await Roulette.deployed();
    try {
      await roulette.play.call({ from: accounts[1] });
    } catch (e) {
      return true;
    }

    return false;
  });
});
