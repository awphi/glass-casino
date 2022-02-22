/// @title Roulette 0.2.2
/// @author awphi (https://github.com/awphi)

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ICentralBank.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Game is Ownable {
    ICentralBank internal _bank;

    constructor(address bankAddr) {
        _bank = ICentralBank(bankAddr);
    }

    modifier minimumBet(uint256 v, uint256 min) {
        require(v > min, "Invalid bet amount.");
        _;
    }

    modifier requireFunds(uint256 v) {
        require(_bank.balanceOf(msg.sender) >= v, "Insufficient funds to cover bet.");
        _;
    }
}
