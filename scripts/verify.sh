#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}║     🔍 BaseScan Contract Verification Tool 🔍        ║${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo ""
    exit 1
fi

source .env

# Check for API key
if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${RED}❌ Error: BASESCAN_API_KEY not found in .env${NC}"
    echo ""
    echo -e "${YELLOW}📝 Setup Instructions:${NC}"
    echo "   1. Go to: ${CYAN}https://basescan.org/myapikey${NC}"
    echo "   2. Sign up/Login and create an API key"
    echo "   3. Add to your .env file:"
    echo ""
    echo -e "${BLUE}      BASESCAN_API_KEY=your_api_key_here${NC}"
    echo ""
    exit 1
fi

# Get contract address (from args or auto-detect)
if [ -n "$1" ]; then
    CONTRACT_ADDRESS=$1
else
    # Try to extract from latest deployment
    DEPLOYMENT_FILE="broadcast/Deploy.s.sol/84532/run-latest.json"

    if [ -f "$DEPLOYMENT_FILE" ]; then
        CONTRACT_ADDRESS=$(grep -o '"contractAddress": *"0x[a-fA-F0-9]\{40\}"' "$DEPLOYMENT_FILE" | head -1 | sed 's/.*"0x/0x/' | sed 's/".*//')
    fi
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ Error: No contract address found${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "   ${CYAN}bash scripts/verify.sh <contract_address>${NC}"
    echo "   ${CYAN}bash scripts/verify.sh 0x1234...${NC}"
    echo ""
    echo "   Or run after deployment to auto-detect"
    echo ""
    exit 1
fi

# Validate address format
if [[ ! $CONTRACT_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo -e "${RED}❌ Error: Invalid contract address format${NC}"
    echo "   Address: $CONTRACT_ADDRESS"
    echo ""
    exit 1
fi

echo -e "${BLUE}📋 Contract Information${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${YELLOW}Contract Address:${NC} ${GREEN}$CONTRACT_ADDRESS${NC}"
echo -e "  ${YELLOW}Network:${NC}          ${GREEN}Base Sepolia (Chain ID: 84532)${NC}"
echo -e "  ${YELLOW}Compiler:${NC}         ${GREEN}Solidity 0.8.28${NC}"
echo -e "  ${YELLOW}Optimizer:${NC}        ${GREEN}Enabled (200 runs)${NC}"
echo ""

# Constructor arguments
ENTROPY_ADDRESS="0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c"
PROVIDER_ADDRESS="0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344"

echo -e "${BLUE}🔧 Constructor Arguments${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${YELLOW}Entropy Provider:${NC}  $ENTROPY_ADDRESS"
echo -e "  ${YELLOW}Default Provider:${NC}  $PROVIDER_ADDRESS"
echo -e "  ${YELLOW}Use Callback:${NC}      ${GREEN}true${NC}"
echo ""

# Encode constructor arguments
echo -e "${BLUE}⚙️  Encoding constructor arguments...${NC}"
CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(address,address,bool)" $ENTROPY_ADDRESS $PROVIDER_ADDRESS true)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to encode constructor arguments${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Encoded successfully${NC}"
echo -e "  ${CYAN}$CONSTRUCTOR_ARGS${NC}"
echo ""

# Start verification
echo -e "${BLUE}🚀 Starting Verification Process${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⏳ This may take 15-30 seconds...${NC}"
echo ""

# Run verification
forge verify-contract \
    $CONTRACT_ADDRESS \
    src/RockPaperScissors.sol:RockPaperScissors \
    --chain-id 84532 \
    --constructor-args $CONSTRUCTOR_ARGS \
    --etherscan-api-key $BASESCAN_API_KEY \
    --verifier-url https://api-sepolia.basescan.org/api \
    --watch

VERIFICATION_STATUS=$?

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $VERIFICATION_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║         ✅ Contract Verified Successfully! ✅         ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📱 View Your Verified Contract:${NC}"
    echo ""
    echo -e "${GREEN}🔗 Main Page:${NC}"
    echo -e "   ${CYAN}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS${NC}"
    echo ""
    echo -e "${GREEN}📄 Source Code:${NC}"
    echo -e "   ${CYAN}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#code${NC}"
    echo ""
    echo -e "${GREEN}👀 Read Contract:${NC}"
    echo -e "   ${CYAN}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#readContract${NC}"
    echo ""
    echo -e "${GREEN}✍️  Write Contract:${NC}"
    echo -e "   ${CYAN}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#writeContract${NC}"
    echo ""

else
    echo ""
    echo -e "${YELLOW}⚠️  Verification Failed or Already Verified${NC}"
    echo ""
    echo -e "${BLUE}Common Reasons:${NC}"
    echo "  • Contract is already verified ✓"
    echo "  • Constructor arguments mismatch"
    echo "  • Different compiler settings"
    echo "  • API key rate limit"
    echo ""
    echo -e "${BLUE}Check Status Manually:${NC}"
    echo -e "  ${CYAN}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#code${NC}"
    echo ""

    # Try alternative method
    echo -e "${YELLOW}💡 Trying Alternative Verification Method...${NC}"
    echo ""

    forge verify-contract \
        $CONTRACT_ADDRESS \
        src/RockPaperScissors.sol:RockPaperScissors \
        --chain-id 84532 \
        --constructor-args $CONSTRUCTOR_ARGS \
        --verifier etherscan \
        --etherscan-api-key $BASESCAN_API_KEY \
        --watch

    ALT_STATUS=$?

    if [ $ALT_STATUS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Verified with alternative method!${NC}"
        echo -e "${CYAN}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#code${NC}"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  Both methods completed. Check the link above to confirm.${NC}"
        echo ""
    fi
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Verification process complete!${NC}"
echo ""
