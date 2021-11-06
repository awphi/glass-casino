pragma solidity ^0.8.7;

contract SimpleGame {
    struct Bet {
        address payable player;
        uint bet_outcome;
        uint bet_amount;
    }
    
    // Used so dApp can listen to emitted event to update UIs as soon as the outcome is rolled
    event OutcomeDecided(uint roll);
    
    
    // House is not payable (no skimming money off the top)
    address house;
    bool ready = true;
    Bet[] bets;
    address payable[] winners;
    
    // Sets the house on minting of the contract, i.e. who controls the flow of the game
    constructor() {
        house = msg.sender;
    }
    
    // Note: Using KECCAK is a hack until chainlink VRF is available on the AVAX mainnet for prod
    function random(uint mod) private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % mod;
    } 
    
    function deposit(uint bet_outcome) public payable {
        require(ready);
        bets.push(Bet(payable(msg.sender), bet_outcome, msg.value));
    }


    function play() public {
        require(msg.sender == house);
        require(ready);
        
        ready = false;
        // Game logic, loop through bets - winners will receive the pot / number of winners
        uint roll = random(2);
        emit OutcomeDecided(roll);
        
        for(uint256 i = 0; i < bets.length; i ++) {
            if(roll == bets[i].bet_outcome) {
                winners.push(bets[i].player);
            }
        }
        
        uint256 payout = address(this).balance / winners.length;
        
        for(uint256 i = 0; i < winners.length; i ++) {
            winners[i].transfer(payout);
        }
        
        ready = true;
        delete winners;
        delete bets;
    }
}