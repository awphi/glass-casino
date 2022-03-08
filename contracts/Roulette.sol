/// @title Roulette 0.2.2
/// @author awphi (https://github.com/awphi)

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ICentralBank.sol";
import "./Game.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Roulette is Game {
  struct Bet {
    uint16 bet_type;
    uint16 bet;
    uint64 timestamp;
    address player;

    uint256 bet_amount;
  }

  constructor(address bankAddr) Game(bankAddr) {
    lastRoll = block.number;
  }

  uint256 public lastRoll = 0;
  uint128 public numBets = 0;
  Bet[128] bets;

  // Used so dApp can listen to emitted event to update UIs as soon as the outcome is rolled
  event OutcomeDecided(uint roll);
  event BetPlaced(Bet bet);

  function get_max_bets() public view returns (uint) {
    return bets.length;
  }

  function place_bet(uint16 bet_type, uint256 bet_amount, uint16 bet) public minimumBet(bet_amount, 0) requireFunds(bet_amount) {
    require(numBets < bets.length, "Maximum bets reached.");

    _bank.subtractFunds(msg.sender, bet_amount);
    bets[numBets] = Bet(bet_type, bet, uint64(block.timestamp), msg.sender, bet_amount);
    emit BetPlaced(bets[numBets]);
    numBets += 1;
  }

  // Note: Replace with chainlink
  function _random(uint mod) internal view returns (uint) {
    return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % mod;
  }

  function _is_red(uint roll) internal pure returns (bool) {
    if (roll < 11 || (roll > 18 && roll < 29)) {
      // Red odd, black even
      return roll % 2 == 1;
    } else {
      return roll % 2 == 0;
    }
  }

  function _calculate_winnings(Bet memory bet, uint roll) internal pure returns (uint) {
    // House edge
    if (roll == 0) {
      return 0;
    }

    /*
    COLOUR = 0,
    ODDEVEN = 1,
    STRAIGHTUP = 2,
    HIGHLOW = 3, 
    COLUMN = 4, 
    DOZENS = 5, 
    SPLIT = 6, 
    STREET = 7, 
    CORNER = 8, 
    LINE = 9, 
    FIVE = 10, 
    BASKET = 11, 
    SNAKE = 12 
    */

    if (bet.bet_type == 0) {
      // 0 = red, 1 = black
      if (bet.bet == (_is_red(roll) ? 0 : 1)) {
        return bet.bet_amount * 2;
      }
    } else if (bet.bet_type == 1) {
      // 0 = even, 1 = odd
      if (bet.bet == (roll % 2)) {
        return bet.bet_amount * 2;
      }
    } else if (bet.bet_type == 2) {
      if (bet.bet == roll) {
        return bet.bet_amount * 35;
      }
    }

    return 0;
  }

  function play() public onlyOwner {
    uint roll = _random(37);
    emit OutcomeDecided(roll);

    for (uint i = 0; i < numBets; i++) {
      uint winnings = _calculate_winnings(bets[i], roll);
      if(winnings > 0) {
        // If player won (w > 0) designate their winnings (incl. stake) to them
        _bank.addFunds(bets[i].player, winnings);
      } else if(roll == 0) {
        /** @dev When a 0 is rolled, house will skim all bets. This can be used to pay for more LINK, hosting fees or just treated as profit - 
          it up to the owner. In the long-term, with enough initial capital this is a stable system.
        **/
        _bank.addFunds(owner(), bets[i].bet_amount);
      }
    }

    numBets = 0;
    lastRoll = block.number;
  }
}
