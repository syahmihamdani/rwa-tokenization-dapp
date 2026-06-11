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

| Contract | Description |
|---|---|
| `PropertyToken.sol` | Represents property ownership as digital tokens. Handles token minting, investor balances, transfers, ownership calculation, and voting power. |
| `PropertyRegistry.sol` | Stores property information such as location, valuation, verification status, and document references. Ensures each token is connected to a specific property. |
| `DividendDistributor.sol` | Manages rental dividend distribution. Income is distributed proportionally based on tokens owned by each investor. |
| `PropertyDAO.sol` | Manages DAO governance — proposal creation, voting, result calculation, and quorum verification. |

## Technology Stack

| Component | Technology |
|---|---|
| Blockchain | Ethereum (Sepolia Testnet) |
| Smart Contracts | Solidity 0.8.28, OpenZeppelin |
| Development Tools | Hardhat |
| Frontend | React 19, Vite, Tailwind CSS |
| Web3 Integration | Ethers.js |
| Wallet | MetaMask |

## Project Structure

```
rwa-dapp/
├── contracts/          # Hardhat project with Solidity contracts
│   ├── contracts/      # Smart contract source files
│   └── scripts/        # Deployment scripts
└── frontend/           # React + Vite frontend
    └── src/
        ├── pages/      # Dashboard, Admin, Governance
        ├── context/    # React context providers
        └── utils/      # Helper utilities
```

## Getting Started

### Prerequisites

- Node.js
- MetaMask wallet
- Sepolia testnet ETH (for deployment)

### Smart Contracts

```bash
cd rwa-dapp/contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend

```bash
cd rwa-dapp/frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` files in both `rwa-dapp/contracts/` and `rwa-dapp/frontend/` with the required configuration (RPC URL, private key, contract addresses, etc.).

## Project Scope

This project focuses on a prototype of real estate tokenization and DAO governance. The system runs on an Ethereum testnet or local network and does not use real-value cryptocurrency transactions. Legal ownership of real-world property is not handled directly in this prototype, and asset verification is simulated or performed manually.
