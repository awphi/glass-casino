const Roulette = artifacts.require("Roulette");
contract("Roulette", function (accounts) {
  it("should initially be no bets", async function () {
    const roulette = await Roulette.deployed();
    const bets = await roulette["get_bets_n"].call();
    return assert.equal(bets, 0);
  });
});
