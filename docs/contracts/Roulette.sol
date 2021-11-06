pragma solidity ^0.8.7;

// SPDX-License-Identifier: UNLICENSED

contract Roulette {
    enum BetType{ 
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
        address payable player;
        BetType bet_type;
        uint bet;
        uint bet_amount;
    }
    
    
    
    // Used so dApp can listen to emitted event to update UIs as soon as the outcome is rolled
    event OutcomeDecided(uint roll);
    event BetPlaced(Bet bet);
    
    address house;
    bool ready = true;
    Bet[] bets;
    
    // Sets the house on minting of the contract, i.e. who controls the flow of the game
    constructor() {
        house = msg.sender;
    }
    
    // Note: Replace with chainlink
    function random(uint mod) private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % mod;
    } 
    
    function get_bets_n() public view returns (uint) {
        return bets.length;
    }

    function deposit(BetType bet_type, uint bet) public payable {
        require(ready);
        require(msg.value > 0);
        Bet memory b = Bet(payable(msg.sender), bet_type, bet, msg.value);
        bets.push(b);
        emit BetPlaced(b);
    }
    
    function is_red(uint roll) pure private returns (bool) {
        if(roll < 11 || (roll > 18 && roll < 29)) {
            // Red odd, black even
            return roll % 2 == 1;
        } else {
            return roll % 2 == 0;
        }           
    }
    
    function get_winnings(Bet memory bet, uint roll) pure private returns (uint256) {
        // House edge, contract keeps the money
        if(roll == 0) {
            return 0;
        }
        
        if(bet.bet_type == BetType.COLOUR) {
            // 0 = red, 1 = black
            if(bet.bet == (is_red(roll) ? 0 : 1)) {
                return bet.bet_amount * 2;
            }
        } else if(bet.bet_type == BetType.ODDEVEN) {
            // 0 = even, 1 = odd
            if(bet.bet == (roll % 2)) {
                return bet.bet_amount * 2;
            }
        } else if(bet.bet_type == BetType.STRAIGHTUP) {
            if(bet.bet == roll) {
                return bet.bet_amount * 35;
            }
        }
        
        return 0;
    }
    
    function play() public {
        require(msg.sender == house);
        require(ready);
        
        ready = false;
        
        uint roll = random(37);
        emit OutcomeDecided(roll);
        
        for(uint256 i = 0; i < bets.length; i ++) {
            uint256 w = get_winnings(bets[i], roll);
            
            if(w > 0) {
               bets[i].player.transfer(w);
            }
        }
        
        delete bets;
        ready = true;
    }
}