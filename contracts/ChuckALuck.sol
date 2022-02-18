// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Bank.sol";
import "./Owned.sol";

contract ChuckALuck is VRFConsumerBase, Owned, Bank {
    bytes32 internal keyHash;
    uint internal fee;

    struct Bet {
        uint8 bet;
        uint248 bet_amount;
    }
    
    mapping (address => bytes32) requests;
    mapping(bytes32 => uint256) results;
    mapping (bytes32 => Bet) bets;

    event GameComplete(Bet bet, uint[] rolls, uint winnings);
    event RandomnessFulfilled(bytes32 request);

    constructor() VRFConsumerBase(
        0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
        0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
    ) {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.0001 ether;
    }

    function calculate_winnings(Bet memory bet, uint[] memory rolls) public pure returns (uint) {
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
    
    function play(uint8 bet, uint248 bet_amount) public returns (bytes32) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - house needs to refill the contract!");
        require(requests[msg.sender] == 0, "Sender has game pending - try again later.");
        require(bet_amount > 0, "Invalid bet amount.");


        bytes32 req = requestRandomness(keyHash, fee);
        requests[msg.sender] = req;

        // Clear out previous randomness
        delete results[req];

        funds[msg.sender] -= bet_amount;
        bets[req] = Bet(bet, bet_amount);
        return req;
    }

    function expand(uint randomValue, uint n, uint mod, uint add) public pure returns (uint[] memory expandedValues) {
        expandedValues = new uint[](n);
        for (uint i = 0; i < n; i++) {
            expandedValues[i] = (uint(keccak256(abi.encode(randomValue, i))) % mod) + add;
        }
        return expandedValues;
    }

    // Just store the result as to avoid transaction reversion
    function fulfillRandomness(bytes32 requestId, uint randomness) internal override {
        // Bound between [1, max(uint256)] to keep 0 as a reserved value (indicating result is pending!)
        results[requestId] = (randomness % type(uint256).max) + 1;
        emit RandomnessFulfilled(requestId);
    }

    function claim() public returns (Bet memory bet, uint[] memory rolls, uint winnings) {
        require(requests[msg.sender] != 0, "No active bet found - please place one first.");
        bytes32 requestId = requests[msg.sender];
        uint randomness = results[requestId];
        require(randomness != 0, "Randomness still pending - please wait a moment.");

        bet = bets[requestId];
        // Expand rolls to 3 values bounded [1, 6]
        rolls = expand(randomness, 3, 6, 1);
        winnings = calculate_winnings(bet, rolls);

        if(winnings > 0) {
            funds[msg.sender] += winnings;
        } else {
            funds[owner] += bet.bet_amount;
        }

        delete requests[msg.sender];
        return (bet, rolls, winnings);
    }

    function withdrawLink() public {
        LINK.transfer(payable(owner), LINK.balanceOf(address(this)));
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
