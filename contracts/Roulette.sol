/// @title Roulette 0.2.0
/// @author awphi (https://github.com/awphi)
/// @notice Roulette game from GlassCasino - L3 BSc ComSci Project @ Durham University
/// @dev -

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Bank.sol";
import "./Owned.sol";

contract Roulette is Owned, Bank {
  enum BetType {
    COLOUR,
    ODDEVEN,
    STRAIGHTUP
    /*
    HIGHLOW, 
    COLUMN, 
    DOZENS, 
    SPLIT, 
    STREET, 
    CORNER, 
    LINE, 
    FIVE, 
    BASKET, 
    SNAKE 
    */
  }

  struct Bet {
    address player;
    BetType bet_type;
    uint bet;
    uint bet_amount;
    uint timestamp;
  }

  // Used so dApp can listen to emitted event to update UIs as soon as the outcome is rolled
  event OutcomeDecided(uint roll);
  event BetPlaced(Bet bet);

  Bet[] bets;
  mapping(address => Bet) betsMap;

  function get_bets() public view returns (Bet[] memory) {
    return bets;
  }

  function get_bets_length() public view returns (uint) {
    return bets.length;
  }

  function place_bet(BetType bet_type, uint bet_amount, uint bet) public {
    require(bet_amount > 0 && funds[msg.sender] >= bet_amount);
    funds[msg.sender] -= bet_amount;
    Bet memory b = Bet(msg.sender, bet_type, bet, bet_amount, block.timestamp);
    bets.push(b);
    emit BetPlaced(b);
  }

  // Note: Replace with chainlink
  function random(uint mod) public view returns (uint) {
    return
      uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % mod;
  }

  function is_red(uint roll) public pure returns (bool) {
    if (roll < 11 || (roll > 18 && roll < 29)) {
      // Red odd, black even
      return roll % 2 == 1;
    } else {
      return roll % 2 == 0;
    }
  }

  function calculate_winnings(Bet memory bet, uint roll) public pure returns (uint) {
    // House edge
    if (roll == 0) {
      return 0;
    }

    if (bet.bet_type == BetType.COLOUR) {
      // 0 = red, 1 = black
      if (bet.bet == (is_red(roll) ? 0 : 1)) {
        return bet.bet_amount * 2;
      }
    } else if (bet.bet_type == BetType.ODDEVEN) {
      // 0 = even, 1 = odd
      if (bet.bet == (roll % 2)) {
        return bet.bet_amount * 2;
      }
    } else if (bet.bet_type == BetType.STRAIGHTUP) {
      if (bet.bet == roll) {
        return bet.bet_amount * 35;
      }
    }

    return 0;
  }

  function play() public onlyHouse {
    uint roll = random(37);
    emit OutcomeDecided(roll);

    for (uint i = 0; i < bets.length; i++) {
      if (roll == 0) {
        // If it came up with the house edge, designate stake to the house
        funds[owner] += bets[i].bet_amount;
      } else {
        uint w = calculate_winnings(bets[i], roll);
        if(w > 0) {
          // Else if player won (w > 0) designate their winnings (incl. stake) to them
          funds[bets[i].player] += w;
        }
        // Else player lost, funds stay in the contract to pay off future winners
      }
    }

    delete bets;
  }
}
