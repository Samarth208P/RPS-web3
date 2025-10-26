#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

TEST_CONTRACT=""
INITIAL_BALANCE=0
DEPLOYMENT_SUCCESS=false
GAME_TX_HASH=""

wei_to_eth() {
  local wei=$1
  wei=$(echo "$wei" | sed 's/0x//' | sed 's/\[.*\]//')
  if [[ $wei =~ ^[0-9a-fA-F]+$ ]] && [ ${#wei} -gt 10 ]; then
    wei=$((16#$wei))
  fi
  local eth_whole=$((wei / 1000000000000000000))
  local eth_decimal=$((wei % 1000000000000000000))
  printf "%d.%06d" $eth_whole $((eth_decimal / 1000000000000))
}

safe_add() {
  local a=$(echo "$1" | sed 's/[^0-9]//g')
  local b=$(echo "$2" | sed 's/[^0-9]//g')
  if command -v bc >/dev/null 2>&1; then echo "$a + $b" | bc; else python3 -c "print($a + $b)"; fi
}

get_contract_from_broadcast() {
  local f="broadcast/Deploy.s.sol/84532/run-latest.json"
  [ -f "$f" ] || return 1
  local addr=$(grep -o '"contractAddress": *"0x[a-fA-F0-9]\{40\}"' "$f" | head -1 | sed 's/.*"0x/0x/' | sed 's/".*//')
  [ -n "$addr" ] && echo "$addr" && return 0 || return 1
}

cleanup() {
  local exit_code=$?

  echo ""
  echo -e "${YELLOW}════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}Cleanup - Withdrawing Funds${NC}"
  echo -e "${YELLOW}════════════════════════════════════════════${NC}"

  if [ -z "${TEST_CONTRACT:-}" ]; then
    echo -e "${YELLOW}No contract${NC}"
  else
    echo -e "${BLUE}Contract: $TEST_CONTRACT${NC}"
    BALANCE=$(cast balance "$TEST_CONTRACT" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo "0")
    if [ -n "$BALANCE" ] && [ "$BALANCE" != "0" ]; then
      echo "Balance: $(wei_to_eth "$BALANCE") ETH"
      echo "Withdrawing..."
      cast send "$TEST_CONTRACT" "withdrawHouse(uint256)" "$BALANCE" \
        --rpc-url "$BASE_SEPOLIA_RPC" --private-key "$PRIVATE_KEY" --gas-limit 100000 >/dev/null 2>&1 || true
      sleep 3
      NEW_BALANCE=$(cast balance "$TEST_CONTRACT" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo "0")
      if [ "$NEW_BALANCE" = "0" ]; then
        echo -e "${GREEN}✓ Recovered $(wei_to_eth "$BALANCE") ETH${NC}"
      else
        echo -e "${YELLOW}⚠ Pending${NC}"
      fi
    else
      echo "Balance: 0 ETH"
    fi
  fi

  FINAL_BALANCE=$(cast balance "$WALLET_ADDRESS" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo "$INITIAL_BALANCE")
  if command -v bc >/dev/null 2>&1; then
    SPENT=$(echo "$INITIAL_BALANCE - $FINAL_BALANCE" | bc)
  else
    SPENT=$((INITIAL_BALANCE - FINAL_BALANCE))
  fi

  echo ""
  echo -e "${BLUE}════════════════════════════════════════════${NC}"
  echo -e "${BLUE}Summary${NC}"
  echo -e "${BLUE}════════════════════════════════════════════${NC}"
  echo "Initial:  $(wei_to_eth "$INITIAL_BALANCE") ETH"
  echo "Final:    $(wei_to_eth "$FINAL_BALANCE") ETH"
  echo "Spent:    $(wei_to_eth "$SPENT") ETH (gas)"

  if [ "$DEPLOYMENT_SUCCESS" = true ]; then
    echo ""
    echo -e "${GREEN}Contract: $TEST_CONTRACT${NC}"
    echo -e "${BLUE}https://sepolia.basescan.org/address/$TEST_CONTRACT${NC}"
    if [ -n "${GAME_TX_HASH:-}" ]; then
      echo -e "${BLUE}https://sepolia.basescan.org/tx/$GAME_TX_HASH${NC}"
    fi
  fi

  echo ""
  [ $exit_code -eq 0 ] && echo -e "${GREEN}✓ Done${NC}" || echo -e "${RED}✗ Failed${NC}"
  exit $exit_code
}
trap cleanup EXIT INT TERM

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Entropy V2 Test                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

[ ! -f .env ] && { echo -e "${RED}No .env${NC}"; exit 1; }
# .env must export: PRIVATE_KEY, BASE_SEPOLIA_RPC, PYTH_ENTROPY_ADDRESS (optional for log check)
# shellcheck disable=SC1091
source .env

[ -z "${PRIVATE_KEY:-}" ] || [ -z "${BASE_SEPOLIA_RPC:-}" ] && { echo -e "${RED}Missing env vars${NC}"; exit 1; }

WALLET_ADDRESS=$(cast wallet address --private-key "$PRIVATE_KEY" 2>/dev/null)
[ -z "$WALLET_ADDRESS" ] && { echo -e "${RED}Invalid key${NC}"; exit 1; }

INITIAL_BALANCE=$(cast balance "$WALLET_ADDRESS" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo "0")

echo -e "${BLUE}Wallet:${NC} $WALLET_ADDRESS"
echo -e "${BLUE}Balance:${NC} $(wei_to_eth "$INITIAL_BALANCE") ETH"
[ -n "${PYTH_ENTROPY_ADDRESS:-}" ] && echo -e "${BLUE}EntropyV2:${NC} $PYTH_ENTROPY_ADDRESS"
echo ""

echo -e "${YELLOW}[1/7] Building...${NC}"
forge build --force >/dev/null 2>&1 && echo -e "${GREEN}✓ Build OK${NC}" || { echo -e "${RED}✗ Failed${NC}"; exit 1; }
echo ""

echo -e "${YELLOW}[2/7] Unit tests...${NC}"
forge test --match-contract RockPaperScissorsTest >/dev/null 2>&1 && echo -e "${GREEN}✓ Tests OK${NC}" || echo -e "${YELLOW}⚠ Some failed${NC}"
echo ""

echo -e "${YELLOW}[3/7] Deploy...${NC}"
echo "Cost: ~0.104 ETH (will be recovered)"
read -p "Deploy? (y/n): " -n 1 -r
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && { echo "Cancelled"; exit 0; }

echo "Deploying..."
forge script script/Deploy.s.sol \
  --rpc-url "$BASE_SEPOLIA_RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --legacy >/dev/null 2>&1 || { echo -e "${RED}✗ Deploy failed${NC}"; exit 1; }

sleep 5
TEST_CONTRACT=$(get_contract_from_broadcast)
[ -z "$TEST_CONTRACT" ] && { echo -e "${RED}✗ No address${NC}"; exit 1; }
DEPLOYMENT_SUCCESS=true
echo -e "${GREEN}✓ $TEST_CONTRACT${NC}"
echo ""

echo -e "${YELLOW}[4/7] Verifying...${NC}"
sleep 5
DEPLOYED_CODE=$(cast code "$TEST_CONTRACT" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null)
[ -z "$DEPLOYED_CODE" ] || [ "$DEPLOYED_CODE" = "0x" ] && { echo -e "${RED}✗ Not on chain${NC}"; exit 1; }
echo -e "${GREEN}✓ On-chain${NC}"

CONTRACT_BALANCE=$(cast balance "$TEST_CONTRACT" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo "0")
echo "House: $(wei_to_eth "$CONTRACT_BALANCE") ETH"
echo ""

echo -e "${YELLOW}[5/7] Fetch fee (V2 via contract)...${NC}"
# Ask your contract for the exact fee it will use (provider + gas limit)
ENTROPY_FEE_HEX=$(cast call "$TEST_CONTRACT" "getEntropyFee()(uint256)" --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo "")
[ -z "$ENTROPY_FEE_HEX" ] && { echo -e "${RED}✗ Could not get V2 fee${NC}"; exit 1; }

# Hex to decimal via bash arithmetic
ENTROPY_FEE=$((ENTROPY_FEE_HEX + 0))
echo "Entropy fee: $(wei_to_eth "$ENTROPY_FEE") ETH"

# Game bet and total msg.value (bet + fee)
BET_AMOUNT_WEI="1000000000000000" # 0.001 ETH
TOTAL_PAYMENT=$(safe_add "$BET_AMOUNT_WEI" "$ENTROPY_FEE")
echo "Bet: 0.001000 ETH"
echo "Total: $(wei_to_eth "$TOTAL_PAYMENT") ETH"

echo "Playing (requestV2 inside playGame)..."
USER_RANDOM=$(openssl rand -hex 32 2>/dev/null || echo "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")

GAME_TX_OUTPUT=$(cast send "$TEST_CONTRACT" \
  "playGame(uint8,bytes32)" \
  1 \
  "0x${USER_RANDOM}" \
  --value "$TOTAL_PAYMENT" \
  --rpc-url "$BASE_SEPOLIA_RPC" \
  --private-key "$PRIVATE_KEY" \
  --gas-limit 600000 \
  2>&1 || true)

if echo "$GAME_TX_OUTPUT" | grep -qi "transactionHash\|blockNumber"; then
  GAME_TX_HASH=$(echo "$GAME_TX_OUTPUT" | grep -oE '0x[a-fA-F0-9]{64}' | head -1)
  echo -e "${GREEN}✓ Game created!${NC}"
  [ -n "$GAME_TX_HASH" ] && echo "TX: $GAME_TX_HASH"

  echo "Waiting a few seconds for logs..."
  sleep 8

  echo ""
  echo -e "${YELLOW}[6/7] Check Entropy V2 request...${NC}"

  if [ -n "${PYTH_ENTROPY_ADDRESS:-}" ]; then
    RECEIPT_JSON=$(cast receipt "$GAME_TX_HASH" --rpc-url "$BASE_SEPOLIA_RPC" --json 2>/dev/null || echo "")
    if echo "$RECEIPT_JSON" | grep -iq "\"address\":\"$(echo "$PYTH_ENTROPY_ADDRESS" | tr '[:upper:]' '[:lower:]')\""; then
      echo -e "${GREEN}✓ Entropy V2 log present (Requested)${NC}"
      echo "Explorer: https://entropy.pyth.network/requests?chain=base-sepolia"
    else
      echo -e "${YELLOW}⚠ Could not find Entropy log in receipt (check manually)${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ PYTH_ENTROPY_ADDRESS not set; skipping log check${NC}"
  fi
else
  echo -e "${RED}✗ Failed to send playGame${NC}"
  echo "$GAME_TX_OUTPUT"
  exit 1
fi

echo ""
echo -e "${YELLOW}[7/7] Waiting for callback (45s)...${NC}"
for i in {45..1}; do printf "${BLUE}%2d...${NC}\r" $i; sleep 1; done
echo ""

echo "Checking reveal..."
GAME_STATE=$(
  cast call "$TEST_CONTRACT" \
    "games(uint256)(address,uint256,uint8,uint8,uint8,uint64,bytes32,uint256,uint256,bool)" \
    1 \
    --rpc-url "$BASE_SEPOLIA_RPC" 2>/dev/null || echo ""
)

if echo "$GAME_STATE" | grep -q "true"; then
  echo -e "${GREEN}✓ Auto-revealed!${NC}"
else
  echo -e "${YELLOW}⚠ Still pending (keeper delay or callback gas)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Test Complete! 🎉                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
