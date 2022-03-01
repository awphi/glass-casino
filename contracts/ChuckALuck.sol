/// @title ChuckALuck 0.2.0
/// @author awphi (https://github.com/awphi)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICentralBank.sol";
import "./Game.sol";

contract ChuckALuck is VRFConsumerBase, Game {
    bytes32 internal _keyHash;
    uint internal _fee;

    struct Bet {
        address player;
        uint64 timestamp;
        uint32 bet;

        uint bet_amount;
    }
    
    mapping (bytes32 => Bet) internal bets;

    event GameComplete(uint[] rolls, Bet bet);
    event GameStart(Bet bet);

    constructor(address vrfCoordinator, address linkToken, bytes32 keyHash, uint fee, address bankAddr) VRFConsumerBase(vrfCoordinator, linkToken) Game(bankAddr) {
        _keyHash = keyHash;
        _fee = fee;
    }

    function _calculate_winnings(Bet memory bet, uint[] memory rolls) internal pure returns (uint) {
        // Count up matching dice rolls
        uint c = 0;
        for(uint i = 0; i < rolls.length; i ++) {
            if(rolls[i] == bet.bet) {
                c += 1;
            }
        }

        if(c == 1) {
            // 1:1 for 1 match
            return bet.bet_amount * 2;
        } else if(c == 2) {
            // 2:1 for 2 matches
            return bet.bet_amount * 2;
        } else if(c == 3) {
            // 10:1 for 3 matches
            return bet.bet_amount * 10;
        }
        return 0;
    }
    
    function play(uint8 bet, uint248 bet_amount) public minimumBet(bet_amount, 0) requireFunds(bet_amount) {
        require(LINK.balanceOf(address(this)) >= _fee, "Not enough LINK - house needs to refill the contract!");

        bytes32 req = requestRandomness(_keyHash, _fee);

        _bank.subtractFunds(msg.sender, bet_amount);
        bets[req] = Bet(msg.sender, uint64(block.timestamp), bet, bet_amount);
        emit GameStart(bets[req]);
    }

    function _expand(uint randomValue, uint n, uint mod, uint add) internal pure returns (uint[] memory expandedValues) {
        expandedValues = new uint[](n);
        for (uint i = 0; i < n; i++) {
            expandedValues[i] = (uint(keccak256(abi.encode(randomValue, i))) % mod) + add;
        }
        return expandedValues;
    }

    function fulfillRandomness(bytes32 requestId, uint randomness) internal override {
        // Expand rolls to 3 values bounded [1, 6]
        uint[] memory rolls = _expand(randomness, 3, 6, 1);
        Bet memory bet = bets[requestId];
        uint winnings = _calculate_winnings(bet, rolls);

        if(winnings > 0) {
            _bank.addFunds(bet.player, winnings);
        } else {
            /** @dev When user loses, house will skim 5% - (the rough average expected loss of each bet with the odds of 2:1, 3:1, 10:1)
                This can be used to pay for more LINK, hosting fees or just treated as profit - it up to the owner. The rest of the loss remains
                in the contract to pay off future winners. In the long-term, with enough initial capital this is a stable system.
            **/
            _bank.addFunds(owner(), bet.bet_amount / 20);
        }
        
        emit GameComplete(rolls, bet);
    }

    function withdrawAllLink() public onlyOwner {
        LINK.transfer(payable(owner()), LINK.balanceOf(address(this)));
    }
}
