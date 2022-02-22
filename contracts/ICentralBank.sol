/// @title ICentralBank 0.1.0
/// @author awphi (https://github.com/awphi)

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface ICentralBank {
    function withdraw(uint256 amount) external;
    function addFunds(address addr, uint256 amount) external;
    function subtractFunds(address addr, uint256 amount) external;
    function deposit() external payable;
    function balanceOf(address add) external view returns (uint);
}