// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Bank.sol";
import "./Owned.sol";

contract Dice is VRFConsumerBase, Owned, Bank {
    bytes32 internal keyHash;
    uint internal fee;

    struct Game {
        bool betHigher;
        uint bet_amount;
        address player;
    }

    event GameComplete(Game stake, uint roll, uint winnings);
    
    mapping (address => bytes32) gameRequests;
    mapping (bytes32 => Game) games;

    constructor() VRFConsumerBase(
        0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
        0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
    ) {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.0001 ether;
    }

    function get_winnings(bool betHigher, uint bet_amount, uint roll) public pure returns (uint256) {
        // House edge
        if(roll == 0 || roll == 100 || roll == 50) {
            return 0;
        }

        // Win
        if((betHigher && roll > 50) || (!betHigher && roll < 50)) {
            return bet_amount * 2;
        }

        // Loss
        return 0;
    }
    
    function play(bool betHigher, uint bet_amount) public {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet.");
        require(gameRequests[msg.sender] == 0, "Sender has game pending - try again later.");
        require(bet_amount > 0, "Invalid bet amount.");


        bytes32 req = requestRandomness(keyHash, fee);
        gameRequests[msg.sender] = req;

        funds[msg.sender] -= bet_amount;
        games[req] = Game(betHigher, bet_amount, msg.sender);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        // Bound roll to [1, 100] (inclusive)
        uint roll = (randomness % 100) + 1;
        Game memory game = games[requestId];

        uint w = 0;
        // House edge
        if(roll == 0 || roll == 100 || roll == 50) {
            funds[owner] += game.bet_amount;
        } else {
            w = get_winnings(game.betHigher, game.bet_amount, roll);
            if(w > 0) {
                funds[game.player] += w;
            }
        }

        gameRequests[game.player] = 0;
        emit GameComplete(game, roll, w);
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
