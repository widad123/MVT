// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract BankBlockchain {
    struct Account {
        uint balance;
        bool exists;
    }

    mapping(address => Account) private accounts;

    // Event to log account creation
    event AccountCreated(address indexed account);
    // Event to log deposits
    event Deposit(address indexed account, uint amount);
    // Event to log withdrawals
    event Withdrawal(address indexed account, uint amount);
    // Event to log transfers
    event Transfer(address indexed from, address indexed to, uint amount);

    function createAccount() public {
        require(!accounts[msg.sender].exists, "Account already exists.");
        accounts[msg.sender] = Account({ balance: 0, exists: true });
        emit AccountCreated(msg.sender);
    }

    function deposit() public payable {
        require(accounts[msg.sender].exists, "Account does not exist.");
        accounts[msg.sender].balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }


    function withdraw(uint amount) public {
        require(accounts[msg.sender].exists, "Account does not exist.");
        require(accounts[msg.sender].balance >= amount, "Insufficient funds.");

        payable(msg.sender).transfer(amount);
        accounts[msg.sender].balance -= amount;
        emit Withdrawal(msg.sender, amount);
    }

    function transfer(address to) public payable {
        require(accounts[msg.sender].exists, "Sender account does not exist.");
        require(accounts[to].exists, "Receiver account does not exist.");
        require(accounts[msg.sender].balance >= msg.value, "Insufficient funds.");

        accounts[msg.sender].balance -= msg.value;
        accounts[to].balance += msg.value;
        emit Transfer(msg.sender, to, msg.value);
    }

    function getBalance() public view returns (uint) {
        require(accounts[msg.sender].exists, "Account does not exist.");
        return accounts[msg.sender].balance;
    }

    function getBalanceOf(address addr) public view returns (uint) {
        require(accounts[addr].exists, "Account does not exist.");
        return accounts[addr].balance;
    }

    function accountExists(address addr) public view returns (bool) {
        return accounts[addr].exists;
    }
}
