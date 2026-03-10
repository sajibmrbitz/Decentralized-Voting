# Decentralized Voting System

A production-ready, tamper-proof, and publicly verifiable decentralized voting system built on Ethereum.

## 🚀 Features

- **On-Chain Governance**: All elections and votes are recorded on the Ethereum blockchain (Sepolia).
- **Publicly Verifiable**: Anyone can audit the results directly from the smart contract.
- **Decentralized Storage**: Candidate metadata and images are stored on IPFS via Pinata.
- **Secure Authentication**: Voters use MetaMask/WalletConnect; Admins use JWT-protected routes.
- **Premium UI**: Modern, responsive, and "glassmorphic" design built with Next.js 14 and TailwindCSS.
- **Mobile First**: Fully optimized for both desktop and mobile browsers.

## 🛠️ Tech Stack

- **Blockchain**: Solidity, Hardhat, Ethers.js, OpenZeppelin.
- **Frontend**: Next.js 14 (App Router), TailwindCSS, RainbowKit, wagmi, Zustand, Recharts.
- **Backend**: Node.js, Express, Prisma (PostgreSQL), Pinata IPFS.

## 📁 Project Structure

```text
decentralized-voting/
├── packages/
│   ├── contracts/      # Solidity smart contracts & Hardhat environment
│   ├── frontend/       # Next.js web application
│   └── backend/        # Express API & Prisma ORM
```

## ⚙️ Setup Instructions

### 1. Smart Contracts

```bash
cd packages/contracts
npm install
# Update .env with PRIVATE_KEY and SEPOLIA_RPC_URL
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network sepolia
```

### 2. Backend

```bash
cd packages/backend
npm install
# Update .env with DATABASE_URL and PINATA keys
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Frontend

```bash
cd packages/frontend
npm install
# Update .env with NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

## 🛡️ Security

- **ReentrancyGuard**: Applied to all state-changing voting functions.
- **Ownable**: Administrative functions (create election, add candidate) restricted to the contract owner.
- **One-Vote Logic**: Enforced on-chain per election per wallet.
- **Time Validation**: Voting only allowed within the specified election window.

## 📜 License

MIT
