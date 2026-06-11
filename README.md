# PropDAO - Real Estate Tokenization DApp

A decentralized application for real-world asset (RWA) tokenization of real estate, powered by DAO governance on the Ethereum blockchain.

## About

PropDAO lets users invest in fractional ownership of real estate properties through blockchain tokens. Property decisions are governed by a DAO — token holders can vote on proposals and receive dividend distributions, all managed transparently through smart contracts.

## Tech Stack

- **Smart Contracts** — Solidity 0.8.28, Hardhat, OpenZeppelin
- **Frontend** — React 19, Vite, Tailwind CSS
- **Blockchain** — Ethers.js, Sepolia testnet
- **Governance** — On-chain DAO voting & dividend distribution

## Smart Contracts

| Contract | Description |
|---|---|
| `PropertyToken.sol` | ERC-20 token representing fractional property ownership |
| `PropertyRegistry.sol` | Registers and manages property listings |
| `PropertyDAO.sol` | DAO governance — proposals and voting |
| `DividendDistributor.sol` | Distributes rental income to token holders |

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

## Environment Variables

Create `.env` files in both `rwa-dapp/contracts/` and `rwa-dapp/frontend/` with the required configuration (RPC URL, private key, contract addresses, etc.).
