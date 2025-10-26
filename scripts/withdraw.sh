#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE} Withdraw House Funds${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Load environment
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  exit 1
fi
source .env

# Get contract address
if [ ! -f frontend/.env.local ]; then
  echo -e "${RED}Error: frontend/.env.local not found!${NC}"
  echo -e "${YELLOW}Please deploy the contract first${NC}"
  exit 1
fi

CONTRACT_ADDRESS=$(grep VITE_CONTRACT_ADDRESS frontend/.env.local | cut -d '=' -f2)
if [ -z "$CONTRACT_ADDRESS" ]; then
  echo -e "${RED}Contract address not found!${NC}"
  exit 1
fi

echo -e "${YELLOW}Contract:${NC} $CONTRACT_ADDRESS"

# Show owner address
OWNER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
echo -e "${YELLOW}Your Address:${NC} $OWNER_ADDRESS\n"

# Check balance
echo -e "${YELLOW}Checking contract balance...${NC}"
BALANCE=$(cast balance $CONTRACT_ADDRESS --rpc-url $BASE_SEPOLIA_RPC)
BALANCE_ETH=$(cast from-wei $BALANCE)
echo -e "Current balance: ${GREEN}$BALANCE_ETH ETH${NC}\n"

if [ "$BALANCE" == "0" ]; then
  echo -e "${RED}Contract has no funds to withdraw${NC}"
  exit 0
fi

# Ask for amount
read -p "Enter amount to withdraw (in ETH) or 'all' for everything: " AMOUNT
if [ -z "$AMOUNT" ]; then
  echo -e "${RED}Amount required${NC}"
  exit 1
fi

# Handle 'all' option
if [ "$AMOUNT" == "all" ]; then
  AMOUNT=$BALANCE_ETH
  echo -e "${YELLOW}Withdrawing all funds: $AMOUNT ETH${NC}"
fi

# Validate amount
AMOUNT_WEI=$(cast to-wei $AMOUNT ether 2>/dev/null)
if [ -z "$AMOUNT_WEI" ]; then
  echo -e "${RED}Invalid amount${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Withdrawing $AMOUNT ETH...${NC}\n"

# Withdraw
cast send $CONTRACT_ADDRESS "withdrawHouse(uint256)" $AMOUNT_WEI \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✓ Withdrawal complete!${NC}\n"
  NEW_BALANCE=$(cast balance $CONTRACT_ADDRESS --rpc-url $BASE_SEPOLIA_RPC)
  NEW_BALANCE_ETH=$(cast from-wei $NEW_BALANCE)
  echo -e "New contract balance: ${GREEN}$NEW_BALANCE_ETH ETH${NC}"
else
  echo -e "\n${RED}Withdrawal failed!${NC}"
  echo -e "${YELLOW}Make sure you are the owner of the contract${NC}"
fi
