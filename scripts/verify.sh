#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Contract Verification                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Load environment
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

source .env

# Contract address (get from latest deployment or pass as arg)
CONTRACT_ADDRESS=${1:-$(grep -o '"contractAddress": *"0x[a-fA-F0-9]\{40\}"' broadcast/Deploy.s.sol/84532/run-latest.json | head -1 | sed 's/.*"0x/0x/' | sed 's/".*//')}

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}Error: No contract address found${NC}"
    echo "Usage: bash scripts/verify.sh <contract_address>"
    echo "Or run after deployment to auto-detect"
    exit 1
fi

echo -e "${BLUE}Contract:${NC} $CONTRACT_ADDRESS"
echo -e "${BLUE}Network:${NC} Base Sepolia (Chain ID: 84532)"
echo ""

# Constructor args (from your Deploy.s.sol)
ENTROPY_ADDRESS="0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c"
PROVIDER_ADDRESS="0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344"
USE_CALLBACK="true"

echo -e "${BLUE}Constructor args:${NC}"
echo "  Entropy: $ENTROPY_ADDRESS"
echo "  Provider: $PROVIDER_ADDRESS"
echo "  UseCallback: $USE_CALLBACK"
echo ""

# Method 1: Using Blockscout (Base Sepolia uses Blockscout)
echo -e "${BLUE}[1/2] Verifying on Blockscout...${NC}"

forge verify-contract \
    $CONTRACT_ADDRESS \
    src/RockPaperScissors.sol:RockPaperScissors \
    --chain-id 84532 \
    --constructor-args $(cast abi-encode "constructor(address,address,bool)" $ENTROPY_ADDRESS $PROVIDER_ADDRESS $USE_CALLBACK) \
    --verifier blockscout \
    --verifier-url https://sepolia.basescan.org/api \
    --watch

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Verified on Blockscout!${NC}"
    echo -e "${BLUE}View: https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#code${NC}"
else
    echo -e "${RED}⚠ Blockscout verification failed (may already be verified)${NC}"
fi

echo ""

# Method 2: Using forge script with --verify flag
echo -e "${BLUE}[2/2] Alternative: Re-run deployment with --verify...${NC}"
echo "If above failed, run:"
echo ""
echo -e "${BLUE}forge script script/Deploy.s.sol \\
    --rpc-url \$BASE_SEPOLIA_RPC \\
    --private-key \$PRIVATE_KEY \\
    --resume \\
    --verify \\
    --verifier blockscout \\
    --verifier-url https://sepolia.basescan.org/api${NC}"

echo ""
echo -e "${GREEN}✓ Verification complete!${NC}"
echo ""
echo -e "${BLUE}Contract URLs:${NC}"
echo "  BaseScan: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS"
echo "  Code: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#code"
echo "  Read: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#readContract"
echo "  Write: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#writeContract"
