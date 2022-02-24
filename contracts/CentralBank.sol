/// @title CentralBank 0.1.0
/// @author awphi (https://github.com/awphi)

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Use AccessControlEnumerable to allow on-chain visibility of current ADMINS and OPERATORS
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICentralBank.sol";

contract CentralBank is AccessControlEnumerable, ICentralBank {
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    mapping(address => uint256) private funds;

    event Withdraw(address addr, uint256 amount, uint256 remaining);
    event Deposit(address addr, uint256 amount, uint256 oldBalance);

    constructor() {
        _setRoleAdmin(OPERATOR, ADMIN);

        // Initially grant contract creator the admin role so they can add fund operators
        _setupRole(ADMIN, msg.sender);
        _setupRole(ADMIN, address(this));
    }

    function revokeRoleAll(bytes32 role) public onlyRole(getRoleAdmin(role))  {        
        // Revoke all
        uint256 count = getRoleMemberCount(role);
        for(uint256 i = 0; i < count; i ++) {
            _revokeRole(role, getRoleMember(role, i));
        }
    }

    function withdraw(uint256 amount) override public {
        require(amount > 0, "Invalid withdrawal amount requested.");
        require(funds[msg.sender] >= amount, "Insufficient funds to process withdrawal.");
        require(address(this).balance >= amount, "Bank has insufficient funds to process withdrawal - try again later.");

        funds[msg.sender] -= amount;
        emit Withdraw(msg.sender, amount, funds[msg.sender]);
        payable(msg.sender).transfer(amount);
    }

    function addFunds(address addr, uint256 amount) override public onlyRole(OPERATOR) {
        // Solidity deals with reversion on overflow
        funds[addr] += amount;
    }

    function subtractFunds(address addr, uint256 amount) override public onlyRole(OPERATOR) {
        // Solidity deals with reversion on underflow
        funds[addr] -= amount;
    }

    function deposit() override public payable {
        require(msg.value > 0, "Invalid deposit amount.");
        uint256 bal = funds[msg.sender];
        funds[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, bal);
    }

    function balanceOf(address add) override public view returns (uint) {
        return funds[add];
    }
}