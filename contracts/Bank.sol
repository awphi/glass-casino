/// @title Bank 0.2.0
/// @author awphi (https://github.com/awphi)

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Bank {
    mapping(address => uint) funds;

    function withdraw(uint amount) public {
        require(amount > 0, "Invalid withdrawal amount requested.");
        require(funds[msg.sender] >= amount, "Insufficient funds to process withdrawal.");
        require(address(this).balance >= amount, "Bank has insufficient funds to process withdrawal - try again later.");

        funds[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function deposit() public payable {
        require(msg.value > 0, "Invalid deposit amount.");
        funds[msg.sender] += msg.value;
    }

    function balanceOf(address add) public view returns (uint) {
        return funds[add];
    }
}