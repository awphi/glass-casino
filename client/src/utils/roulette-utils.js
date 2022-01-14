// Direct port from Roulette.sol contract
export function isRed(roll) {
  if (roll < 11 || (roll > 18 && roll < 29)) {
    // Red odd, black even
    return roll % 2 == 1;
  } else {
    return roll % 2 == 0;
  }
}
