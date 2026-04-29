// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract PropertyToken is ERC20, Ownable, ERC20Permit, ERC20Votes {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 Million tokens

    constructor() 
        ERC20("RWA Property Token", "RWAPT") 
        ERC20Permit("RWA Property Token")
        Ownable(msg.sender) 
    {
        _mint(msg.sender, MAX_SUPPLY);
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
