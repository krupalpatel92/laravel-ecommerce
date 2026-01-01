#!/bin/bash

# Laravel Queue Worker - Stop Script
# Stop all queue workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Laravel queue workers...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if Supervisor is installed
if ! command -v supervisorctl &> /dev/null; then
    echo -e "${RED}Error: Supervisor is not installed${NC}"
    exit 1
fi

# Detect which program is running
PROGRAM_NAME=""
if supervisorctl status | grep -q "laravel-worker-production"; then
    PROGRAM_NAME="laravel-worker-production"
elif supervisorctl status | grep -q "laravel-worker-staging"; then
    PROGRAM_NAME="laravel-worker-staging"
elif supervisorctl status | grep -q "laravel-worker"; then
    PROGRAM_NAME="laravel-worker"
else
    echo -e "${YELLOW}No Laravel workers found in Supervisor${NC}"
    exit 0
fi

echo "Program: $PROGRAM_NAME"
echo ""

# Stop workers
echo "Stopping workers (allowing current jobs to finish)..."
supervisorctl stop "$PROGRAM_NAME:*"

echo ""
echo -e "${GREEN}Workers stopped successfully${NC}"
echo ""
echo "Current status:"
supervisorctl status "$PROGRAM_NAME:*"
