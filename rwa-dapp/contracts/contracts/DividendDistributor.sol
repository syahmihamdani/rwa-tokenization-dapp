// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
    Smart contract ini digunakan untuk mendistribusikan pendapatan sewa
    properti dalam bentuk ETH kepada pemegang token properti (ERC20).
    
    Setiap pemilik token akan memperoleh dividen sesuai jumlah token
    yang dimiliki. Semakin banyak token yang dimiliki, semakin besar
    bagian dividen yang dapat diklaim.
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DividendDistributor is Ownable {
    IERC20 public propertyToken;

    // Total dividen ETH yang telah didistribusikan
    uint256 public totalDividends;

    // Menyimpan nilai dividendPerToken terakhir tiap user
    mapping(address => uint256) public userDividendPerTokenPaid;

    // Menyimpan reward/dividen yang belum diklaim user
    mapping(address => uint256) public rewards;

    // Total dividen per token
    uint256 public dividendPerTokenStored;

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = IERC20(_propertyToken);
    }

    // Menerima pembayaran sewa dalam bentuk ETH
    receive() external payable {
        if (msg.value > 0) {
            uint256 supply = propertyToken.totalSupply();

            if (supply > 0) {
                dividendPerTokenStored += (msg.value * 1e18) / supply;
                totalDividends += msg.value;
            }
        }
    }

    // Mengupdate saldo reward user
    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userDividendPerTokenPaid[account] = dividendPerTokenStored;
        }
        _;
    }

    // Menghitung total dividen yang dapat diklaim user
    function earned(address account) public view returns (uint256) {
        uint256 balance = propertyToken.balanceOf(account);

        uint256 pending =
            (balance *
                (dividendPerTokenStored -
                    userDividendPerTokenPaid[account])) / 1e18;

        return rewards[account] + pending;
    }

    // Mengklaim dividen ETH
    function claimDividend() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];

        if (reward > 0) {
            rewards[msg.sender] = 0;
            payable(msg.sender).transfer(reward);
        }
    }

    // Fungsi pembayaran sewa selain melalui receive()
    function payRent() external payable {
        require(msg.value > 0, "Rent must be greater than 0");

        uint256 supply = propertyToken.totalSupply();
        require(supply > 0, "No tokens minted");

        dividendPerTokenStored += (msg.value * 1e18) / supply;
        totalDividends += msg.value;
    }
}       