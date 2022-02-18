/// @title Owmed 0.1.0
/// @author awphi (https://github.com/awphi)
/// @notice Owned from GlassCasino - L3 BSc ComSci Project @ Durham University
/// @dev -

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Owned {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyHouse {
        require(msg.sender == owner, "Transaction sender is not contract owner.");
        _;
    }
}