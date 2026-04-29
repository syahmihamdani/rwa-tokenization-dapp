32  // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DividendDistributor is Ownable {
    IERC20 public propertyToken;
    uint256 public totalDividends;
    mapping(address => uint256) public userDividendPerTokenPaid;
    mapping(address => uint256) public rewards;
    uint256 public dividendPerTokenStored;

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = IERC20(_propertyToken);
    }

    // Accept ETH rent payments
    receive() external payable {
        if (msg.value > 0) {
            uint256 supply = propertyToken.totalSupply();
            if (supply > 0) {
                dividendPerTokenStored += (msg.value * 1e18) / supply;
                totalDividends += msg.value;
            }
        }
    }

    // Update user's dividend balance
    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userDividendPerTokenPaid[account] = dividendPerTokenStored;
        }
        _;
    }

    function earned(address account) public view returns (uint256) {
        uint256 balance = propertyToken.balanceOf(account);
        uint256 pending = (balance * (dividendPerTokenStored - userDividendPerTokenPaid[account])) / 1e18;
        return rewards[account] + pending;
    }

    // Claim dividends
    function claimDividend() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            payable(msg.sender).transfer(reward);
        }
    }

    // Helper for anyone sending rent directly using a function instead of fallback
    function payRent() external payable {
        require(msg.value > 0, "Rent must be greater than 0");
        uint256 supply = propertyToken.totalSupply();
        require(supply > 0, "No tokens minted");

        dividendPerTokenStored += (msg.value * 1e18) / supply;
        totalDividends += msg.value;
    }
}
