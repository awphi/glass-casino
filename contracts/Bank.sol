/// @title Bank 0.1.0
/// @author awphi (https://github.com/awphi)
/// @notice Bank from GlassCasino - L3 BSc ComSci Project @ Durham University
/// @dev -

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Bank {
    mapping(address => uint) funds;

    function withdraw(uint amount) public {
        require(amount > 0);
        require(funds[msg.sender] >= amount);
        require(address(this).balance >= amount);

        funds[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function deposit() public payable {
        require(msg.value > 0);
        funds[msg.sender] += msg.value;
    }

    function balance() public view returns (uint) {
        return funds[msg.sender];
    }
}