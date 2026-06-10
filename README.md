# PropDAO - Real Estate Tokenization DApp

## Group Members

| Name | NPM |
|---|---|
| Christover Angelo Lasut | 2306220343 |
| Matthew Immanuel Sitorus | 2306221024 |
| Syahmi Hamdani | 2306220532 |

## Project Description

Real World Asset (RWA) tokenization has become one of the key trends in blockchain development over the last few years. Through this system, people can invest in a fraction of a real-world asset, such as real estate, without needing to buy the entire property. By owning property tokens, investors can receive benefits such as rental dividends and voting rights in property management decisions.

One major problem in many RWA tokenization platforms is the centralized role of third parties. In several cases, financial mismanagement, lack of transparency, and fraud can occur because users depend heavily on the platform operator to manage funds, distribute profits, and make property-related decisions. This centralized approach reduces trust and limits investor control over the asset.

PropDAO solves this issue by combining RWA tokenization with a Decentralized Autonomous Organization (DAO). In this system, property ownership is represented using digital tokens on the blockchain, while important management decisions are handled through DAO-based voting. This allows token holders to participate directly in governance, improves transparency, and reduces dependency on centralized intermediaries.

## Main Features

- Real estate asset tokenization using blockchain-based tokens.
- DAO governance for property management decisions.
- Token-weighted voting system for investors.
- Automated rental dividend distribution through smart contracts.
- Property data and document reference storage.
- Wallet-based access using MetaMask.
- Decentralized application frontend for user interaction.

## System Overview

PropDAO allows users to connect their wallet, buy property tokens, view their ownership, claim rental dividends, and participate in governance. The governance system allows token holders to create or vote on proposals such as renovation approval, dividend policy changes, use of reserve funds, replacement of property managers, or asset sale decisions.

Although DAO voting records decisions transparently on-chain, real-world execution is still handled off-chain by an operational admin or property manager. For example, if token holders approve a renovation proposal, the result is recorded on the blockchain, while the actual repair is carried out by a vendor or technician in the real world.

## Smart Contract Architecture

The system consists of four main smart contracts:

### 1. PropertyToken.sol

This contract represents property ownership in the form of digital tokens. It handles token minting, investor balances, token transfers, ownership calculation, and voting power.

### 2. PropertyRegistry.sol

This contract stores basic property information such as location, valuation, verification status, and references to supporting documents. It ensures that each token is connected to a specific property asset.

### 3. DividendDistributor.sol

This contract manages rental dividend distribution. Rental income is distributed proportionally based on the number of tokens owned by each investor.

### 4. PropertyDAO.sol

This contract manages the DAO governance system. It allows token holders to create proposals, vote, calculate voting results, and check whether quorum has been reached.

## Technology Stack

| Component | Technology |
|---|---|
| Blockchain | Ethereum / EVM |
| Smart Contract Language | Solidity |
| Development Tools | Hardhat / Truffle |
| Frontend | React, Vite, Tailwind CSS |
| Web3 Integration | Ethers.js / Web3.js |
| Wallet | MetaMask |
| Storage | IPFS / Pinata |
| Network | Local Network / Ethereum Testnet |

## Project Scope

This project focuses on a prototype of real estate tokenization and DAO governance. The system runs on an Ethereum testnet or local network and does not use real-value cryptocurrency transactions. Legal ownership of real-world property is not handled directly in this prototype, and asset verification is simulated or performed manually.

## Conclusion

PropDAO demonstrates how blockchain, smart contracts, tokenization, and DAO governance can be used to create a more transparent and democratic real estate investment platform. By reducing dependency on centralized intermediaries, the system gives investors more control over property-related decisions while improving trust through on-chain records.
