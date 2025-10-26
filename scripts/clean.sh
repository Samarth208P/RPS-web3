#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Rock Paper Scissors - Clean Script${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo -e "${YELLOW}What would you like to clean?${NC}"
echo "1) Foundry artifacts (cache, out, broadcast)"
echo "2) Frontend (node_modules, dist, .vite)"
echo "3) Both Foundry and Frontend"
echo "4) Everything including dependencies"
read -p "Enter choice [1-4]: " clean_choice

clean_foundry() {
    echo -e "\n${YELLOW}Cleaning Foundry artifacts...${NC}"
    rm -rf cache out broadcast
    echo -e "${GREEN}✓ Foundry artifacts cleaned${NC}"
}

clean_frontend() {
    echo -e "\n${YELLOW}Cleaning Frontend build artifacts...${NC}"
    cd frontend 2>/dev/null
    if [ $? -eq 0 ]; then
        rm -rf dist .vite
        echo -e "${GREEN}✓ Frontend build artifacts cleaned${NC}"
        cd ..
    else
        echo -e "${RED}Frontend directory not found${NC}"
    fi
}

clean_frontend_deps() {
    echo -e "\n${YELLOW}Cleaning Frontend dependencies...${NC}"
    cd frontend 2>/dev/null
    if [ $? -eq 0 ]; then
        rm -rf node_modules package-lock.json
        echo -e "${GREEN}✓ Frontend dependencies cleaned${NC}"
        cd ..
    else
        echo -e "${RED}Frontend directory not found${NC}"
    fi
}

clean_foundry_deps() {
    echo -e "\n${YELLOW}Cleaning Foundry dependencies...${NC}"
    rm -rf lib
    echo -e "${GREEN}✓ Foundry dependencies cleaned${NC}"
}

case $clean_choice in
    1)
        clean_foundry
        ;;
    2)
        clean_frontend
        ;;
    3)
        clean_foundry
        clean_frontend
        ;;
    4)
        echo -e "${RED}⚠️  This will remove all dependencies!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" == "yes" ]; then
            clean_foundry
            clean_frontend
            clean_frontend_deps
            clean_foundry_deps
            echo -e "\n${YELLOW}To reinstall dependencies:${NC}"
            echo -e "Foundry: forge install"
            echo -e "Frontend: cd frontend && npm install"
        else
            echo -e "${YELLOW}Clean cancelled${NC}"
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}   Cleanup Complete! 🧹${NC}"
echo -e "${GREEN}================================================${NC}\n"
