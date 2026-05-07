// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
    Smart contract ini digunakan sebagai token ERC20 untuk merepresentasikan
    kepemilikan aset properti dalam sistem RWA (Real World Asset).

    Token dapat digunakan untuk transaksi, distribusi dividen, dan hak voting
    dalam sistem DAO. Contract ini juga mendukung fitur permit dan voting
    berbasis ERC20Votes.
*/

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract PropertyToken is ERC20, Ownable, ERC20Permit, ERC20Votes {

    // Total maksimum supply token
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18;

    constructor()
        ERC20("RWA PropDAO Token", "PDAO")
        ERC20Permit("RWA PropDAO Token")
        Ownable(msg.sender)
    {
        // Mint seluruh supply awal ke owner
        _mint(msg.sender, MAX_SUPPLY);
    }

    // Mengupdate data token dan voting saat transfer
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    // Mengambil nonce milik user untuk permit signature
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}