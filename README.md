🎮 Rock Paper Scissors — Web3 Game
A provably fair Rock Paper Scissors game built on Base using Pyth Entropy V2. [attached_file:1]

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-purple.svg)]()
[![Base](https://img.shields.io/badge/Base-Sepolia-blue.svg)]() [attached_file:1]


✨ Features
- 🎲 Provably Fair — Verifiable randomness using Pyth Entropy V2. [attached_file:1]
- ⚡ Lightning Fast — Built on Base L2 for instant gameplay. [attached_file:1]
- 💰 High Payouts — 95% payout ratio with only 5% house edge. [attached_file:1]
- 🔒 Secure — ReentrancyGuard and access control patterns. [attached_file:1]
- 📊 Real-time Stats — Track wins, losses, and history. [attached_file:1]
- 🎨 Beautiful UI — Animated interface with GSAP and Framer Motion. [attached_file:1]
- 📱 Responsive — Works on desktop, tablet, and mobile. [attached_file:1]
- 🌐 Web3 Native — Connect with MetaMask, WalletConnect (Reown), and more. [attached_file:1]


🛠️ Tech Stack
Smart Contracts
- Language: Solidity 0.8.28. [attached_file:1]
- Framework: Foundry. [attached_file:1]
- Libraries: OpenZeppelin Contracts. [attached_file:1]
- Randomness: Pyth Entropy V2. [attached_file:1]
- Network: Base Sepolia / Base Mainnet. [attached_file:1]

Frontend
- Framework: React 18 + Vite 5. [attached_file:1]
- Styling: TailwindCSS 3.4.17. [attached_file:1]
- Web3: Wagmi v2 + Viem v2. [attached_file:1]
- Wallet: Reown (WalletConnect v2). [attached_file:1]
- Animations: GSAP + Framer Motion. [attached_file:1]
- State: React Query (TanStack Query). [attached_file:1]


📋 Prerequisites
- Node.js 18+ and npm or yarn. [attached_file:1]
- Git. [attached_file:1]
- Foundry installed (getfoundry.sh). [attached_file:1]
- MetaMask or compatible Web3 wallet. [attached_file:1]
- Base Sepolia ETH (from faucet). [attached_file:1]


🚀 Quick Start
1) Clone
- git clone https://github.com/yourusername/rock-paper-scissors-web3.git [attached_file:1]
- cd rock-paper-scissors-web3 [attached_file:1]

2) Install Foundry deps
- forge install OpenZeppelin/openzeppelin-contracts [attached_file:1]

3) Configure environment
- cp .env.example .env [attached_file:1]
- Edit .env with: [attached_file:1]
  PRIVATE_KEY=your_private_key_here  # without 0x prefix [attached_file:1]
  BASE_SEPOLIA_RPC=https://sepolia.base.org [attached_file:1]
  BASE_MAINNET_RPC=https://mainnet.base.org [attached_file:1]
  BASESCAN_API_KEY=your_basescan_api_key  # get from basescan.org/myapikey [attached_file:1]
  PYTH_ENTROPY_ADDRESS=0x41c9e39574f40ad34c79f1c99b66a45efb830d4c [attached_file:1]

4) Build
- forge build [attached_file:1]

5) Test
- forge test -vv [attached_file:1]

6) Deploy (Base Sepolia)
- bash scripts/deploy.sh [attached_file:1]
- Follow prompts: select 1 (Base Sepolia), contracts auto-verify on BaseScan, address saved to frontend/.env.local. [attached_file:1]

7) Frontend setup
- cd frontend && npm install [attached_file:1]
- cp .env.example .env [attached_file:1]
- Edit frontend/.env: [attached_file:1]
  VITE_CHAIN_ID=84532 [attached_file:1]
  VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org [attached_file:1]
  VITE_BASESCAN_URL=https://sepolia.basescan.org [attached_file:1]
  VITE_CONTRACT_ADDRESS=your_deployed_contract_address  # set after deployment [attached_file:1]
  VITE_PYTH_ENTROPY_ADDRESS=0x41c9e39574f40ad34c79f1c99b66a45efb830d4c [attached_file:1]
  VITE_WALLETCONNECT_PROJECT_ID=your_reown_project_id  # get from cloud.reown.com [attached_file:1]
  VITE_APP_NAME=Rock Paper Scissors [attached_file:1]
  VITE_APP_DESCRIPTION=Provably fair Rock Paper Scissors game on Base [attached_file:1]

8) Run dev server
- npm run dev and open http://localhost:5173 [attached_file:1]


📁 Project Structure
rock-paper-scissors-web3/ [attached_file:1]
├── src/                      # Smart contracts [attached_file:1]
│   ├── RockPaperScissors.sol # Main game contract [attached_file:1]
│   └── interfaces/ [attached_file:1]
│       └── IEntropy.sol      # Pyth Entropy interface [attached_file:1]
├── script/ [attached_file:1]
│   └── Deploy.s.sol          # Deployment script [attached_file:1]
├── test/ [attached_file:1]
│   └── RockPaperScissors.t.sol # Contract tests [attached_file:1]
├── frontend/                 # React app [attached_file:1]
│   ├── src/ [attached_file:1]
│   │   ├── components/       # UI components [attached_file:1]
│   │   ├── config/           # Configuration [attached_file:1]
│   │   ├── hooks/            # React hooks [attached_file:1]
│   │   ├── utils/            # Utilities [attached_file:1]
│   │   └── styles/           # Styles [attached_file:1]
│   ├── public/               # Static assets [attached_file:1]
│   └── index.html [attached_file:1]
├── scripts/                  # Deploy/utility scripts [attached_file:1]
│   ├── deploy.sh             # Automated deployment [attached_file:1]
│   └── clean.sh              # Clean build artifacts [attached_file:1]
├── foundry.toml              # Foundry config [attached_file:1]
└── README.md [attached_file:1]


🎮 How to Play
1) Connect Wallet — Click “Connect Wallet” and link your Web3 wallet. [attached_file:1]
2) Choose Amount — Enter bet amount (0.001–1 ETH). [attached_file:1]
3) Select Choice — Pick Rock ✊, Paper ✋, or Scissors ✌️. [attached_file:1]
4) Play Game — Click “Play Game” and confirm the transaction. [attached_file:1]
5) Wait for Result — Uses Pyth Entropy for fair randomness. [attached_file:1]
6) See Outcome — Win 1.95x, lose stake, or draw refund per settings. [attached_file:1]

Game Rules
- Rock beats Scissors. [attached_file:1]
- Paper beats Rock. [attached_file:1]
- Scissors beats Paper. [attached_file:1]
- Draw refunds per contract configuration. [attached_file:1]
- House Edge: 5% (95% payout on wins). [attached_file:1]


🔧 Smart Contract Details
Main Functions [attached_file:1]

playGame(Choice _choice, bytes32 _userRandomNumber) [attached_file:1]
- Starts a new game with your choice and a user random number. [attached_file:1]
- Parameters: _choice ∈ {1=Rock, 2=Paper, 3=Scissors}, _userRandomNumber is a bytes32 commitment. [attached_file:1]
- Value: Bet amount + entropy fee (auto-calculated). [attached_file:1]

revealGame(uint256 _gameId, bytes32 _userRandomNumber, bytes32 _providerRevelation) [attached_file:1]
- Reveals game result using Pyth Entropy revelation. [attached_file:1]
- Parameters: _gameId from playGame, original _userRandomNumber, provider revelation. [attached_file:1]

getStats() [attached_file:1]
- Returns total games, wins, losses, draws, and house balance. [attached_file:1]

getPlayerGames(address _player) [attached_file:1]
- Returns all game IDs for a player. [attached_file:1]

Contract Addresses [attached_file:1]
- Base Sepolia — Pyth Entropy: 0x41c9e39574f40ad34c79f1c99b66a45efb830d4c [attached_file:1]
- Base Sepolia — Game Contract: set post-deployment. [attached_file:1]


🧪 Testing
- Run all: forge test -vv [attached_file:1]
- Run by name: forge test --match-test testPlayGame -vvvv [attached_file:1]
- Gas report: forge test --gas-report [attached_file:1]
- Coverage: forge coverage [attached_file:1]


🚢 Deployment
Automated (Base Sepolia) [attached_file:1]
- bash scripts/deploy.sh [attached_file:1]

Manual [attached_file:1]
- forge script script/Deploy.s.sol:DeployRockPaperScissors \ [attached_file:1]
  --rpc-url $BASE_SEPOLIA_RPC \ [attached_file:1]
  --broadcast \ [attached_file:1]
  --verify -vvvv [attached_file:1]

Fund the House [attached_file:1]
- cast send <CONTRACT_ADDRESS> "fundHouse()" --value 1ether --rpc-url $BASE_SEPOLIA_RPC --private-key $PRIVATE_KEY [attached_file:1]


🧹 Maintenance
- Clean artifacts: bash scripts/clean.sh [attached_file:1]
- Update frontend: cd frontend && npm update [attached_file:1]
- Update Foundry deps: forge update [attached_file:1]


🔐 Security
- ReentrancyGuard protection. [attached_file:1]
- Ownable access control. [attached_file:1]
- Input validation on all functions. [attached_file:1]
- Safe arithmetic via Solidity 0.8+. [attached_file:1]
- Verifiable randomness via Pyth Entropy. [attached_file:1]
- Transparent on-chain logic. [attached_file:1]

Audit Status
- Not professionally audited; use at your own risk. [attached_file:1]


📊 Game Economics
- Minimum Bet: 0.001 ETH [attached_file:1]
- Maximum Bet: 1 ETH [attached_file:1]
- House Edge: 5% [attached_file:1]
- Payout Ratio: 95% [attached_file:1]
- Win Multiplier: 1.95x [attached_file:1]
- Draw Fee: 0.0001 ETH (if draw mode charges) [attached_file:1]

Example Payouts [attached_file:1]
| Bet Amount | Win Payout | Net Profit |
|------------|------------|------------|
| 0.01 ETH   | 0.0195 ETH | 0.0095 ETH |
| 0.1 ETH    | 0.195 ETH  | 0.095 ETH  |
| 1 ETH      | 1.95 ETH   | 0.95 ETH   | [attached_file:1]


🐛 Troubleshooting
Common Issues and Fixes [attached_file:1]

- Deployment fails: Check PRIVATE_KEY and RPC URL; ensure enough gas. [attached_file:1]
- Frontend not connecting: Verify CONTRACT_ADDRESS in frontend/.env and correct Base Sepolia network. [attached_file:1]
- Revert “InsufficientHouseBalance”: Fund the house contract with cast send. [attached_file:1]
- “Invalid Choice” errors: Choice must be 1 (Rock), 2 (Paper), or 3 (Scissors). [attached_file:1]
- Frontend build errors: cd frontend; remove node_modules and lockfile; reinstall. [attached_file:1]


🤝 Contributing
1) Fork the repo. [attached_file:1]
2) Create a branch: git checkout -b feature/AmazingFeature [attached_file:1]
3) Commit: git commit -m "Add some AmazingFeature" [attached_file:1]
4) Push: git push origin feature/AmazingFeature [attached_file:1]
5) Open a Pull Request. [attached_file:1]


📝 License
- MIT License (see LICENSE). [attached_file:1]


🙏 Acknowledgments
- Pyth Network (Entropy V2). [attached_file:1]
- Base (L2). [attached_file:1]
- OpenZeppelin (contracts). [attached_file:1]
- Foundry (tooling). [attached_file:1]
- Wagmi (React hooks). [attached_file:1]
- Reown (WalletConnect). [attached_file:1]


📞 Support
- Issues: GitHub Issues in this repo. [attached_file:1]
- Discussions: GitHub Discussions in this repo. [attached_file:1]
- Twitter: @yourhandle. [attached_file:1]


🔗 Links
- Live Demo: https://rps-game.xyz [attached_file:1]
- Base Sepolia Explorer: https://sepolia.basescan.org [attached_file:1]
- Pyth Entropy Docs: https://docs.pyth.network/entropy [attached_file:1]
- Base Docs: https://docs.base.org [attached_file:1]


⚠️ Disclaimer
This is a gambling game; play responsibly and only with funds you can afford to lose, as the house has a mathematical edge. [attached_file:1]


— Built with ❤️ by Your Name • Powered by Pyth Entropy • Base • React • Foundry [attached_file:1]
