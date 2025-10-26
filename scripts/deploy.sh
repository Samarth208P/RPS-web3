#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ Rock Paper Scissors - Deployment          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${RED}✗ Error: .env file not found!${NC}"
  exit 1
fi

# Load environment variables
source .env

# Verify required variables
if [ -z "${PRIVATE_KEY:-}" ]; then
  echo -e "${RED}✗ Error: PRIVATE_KEY not set in .env${NC}"
  exit 1
fi

if [ -z "${PYTH_ENTROPY_ADDRESS:-}" ]; then
  echo -e "${RED}✗ Error: PYTH_ENTROPY_ADDRESS not set in .env${NC}"
  exit 1
fi

# Show deployer address
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
echo -e "${GREEN}Deployer:${NC} $DEPLOYER_ADDRESS"

# Build contracts
echo -e "\n${YELLOW}Building contracts...${NC}"
forge build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Build failed!${NC}"
  forge build
  exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
TEST_OUTPUT=$(forge test 2>&1)
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Tests failed!${NC}"
  echo "$TEST_OUTPUT"
  exit 1
fi
echo -e "${GREEN}✓ All tests passed${NC}"

# Ask for network selection
echo -e "\n${BLUE}Select network:${NC}"
echo " 1) Base Sepolia (Testnet)"
echo " 2) Base Mainnet"
read -p "Choice [1-2]: " network_choice

case $network_choice in
  1)
    NETWORK="base_sepolia"
    RPC_URL=$BASE_SEPOLIA_RPC
    EXPLORER="https://sepolia.basescan.org"
    CHAIN_ID=84532
    ;;
  2)
    NETWORK="base"
    RPC_URL=$BASE_MAINNET_RPC
    EXPLORER="https://basescan.org"
    CHAIN_ID=8453
    echo -e "${RED}⚠️ MAINNET deployment!${NC}"
    read -p "Confirm (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      exit 0
    fi
    ;;
  *)
    echo -e "${RED}✗ Invalid choice${NC}"
    exit 1
    ;;
esac

if [ -z "${RPC_URL:-}" ]; then
  echo -e "${RED}✗ RPC URL not set for selected network in .env${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Deploying to $NETWORK...${NC}"
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol:DeployRockPaperScissors \
  --rpc-url $RPC_URL \
  --broadcast \
  2>&1)

# Extract contract and owner from Deploy.s.sol logs
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -E "Contract Address:" | awk '{print $3}')
OWNER_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -E "Owner Address:" | awk '{print $3}')

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo -e "${RED}✗ Deployment failed!${NC}"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi

echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ Deployment Successful! 🎉                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}\n"
echo -e "${BLUE}Contract:${NC} $CONTRACT_ADDRESS"
echo -e "${BLUE}Owner:${NC} $OWNER_ADDRESS"
echo -e "${BLUE}Network:${NC} $NETWORK"
echo -e "${BLUE}Explorer:${NC} $EXPLORER/address/$CONTRACT_ADDRESS"

# Create frontend directory
mkdir -p frontend

# Get entropy provider
ENTROPY_PROVIDER=$(cast call $PYTH_ENTROPY_ADDRESS "getDefaultProvider()(address)" --rpc-url $RPC_URL 2>/dev/null || echo "0x0000000000000000000000000000000000000000")

# Create frontend/.env.local
echo -e "\n${YELLOW}Updating frontend configuration...${NC}"
cat > frontend/.env.local << EOF
VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
VITE_PYTH_ENTROPY_ADDRESS=$PYTH_ENTROPY_ADDRESS
VITE_ENTROPY_PROVIDER=$ENTROPY_PROVIDER
EOF
echo -e "${GREEN}✓ frontend/.env.local created${NC}"

# Update frontend/.env if it exists
if [ -f frontend/.env ]; then
  TEMP_FILE=$(mktemp)
  awk -v contract="$CONTRACT_ADDRESS" -v entropy="$PYTH_ENTROPY_ADDRESS" -v provider="$ENTROPY_PROVIDER" '
    /^VITE_CONTRACT_ADDRESS=/ {print "VITE_CONTRACT_ADDRESS=" contract; next}
    /^VITE_PYTH_ENTROPY_ADDRESS=/ {print "VITE_PYTH_ENTROPY_ADDRESS=" entropy; next}
    /^VITE_ENTROPY_PROVIDER=/ {print "VITE_ENTROPY_PROVIDER=" provider; next}
    {print}
  ' frontend/.env > "$TEMP_FILE"
  mv "$TEMP_FILE" frontend/.env
  echo -e "${GREEN}✓ frontend/.env updated${NC}"
fi

echo -e "\n${GREEN}Ready to play! Run: ${YELLOW}cd frontend && npm run dev${NC}\n"
