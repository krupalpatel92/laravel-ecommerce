#!/bin/bash

# Laravel Queue Worker - Start Script
# Start all queue workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Laravel queue workers...${NC}"

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

# Detect which program is configured
PROGRAM_NAME=""
if [ -f "/etc/supervisor/conf.d/laravel-worker-production.conf" ]; then
    PROGRAM_NAME="laravel-worker-production"
elif [ -f "/etc/supervisor/conf.d/laravel-worker-staging.conf" ]; then
    PROGRAM_NAME="laravel-worker-staging"
elif [ -f "/etc/supervisor/conf.d/laravel-worker.conf" ]; then
    PROGRAM_NAME="laravel-worker"
else
    echo -e "${RED}Error: No Laravel worker configuration found${NC}"
    echo "Run deploy-supervisor.sh first to configure workers"
    exit 1
fi

echo "Program: $PROGRAM_NAME"
echo ""

# Start workers
echo "Starting workers..."
supervisorctl start "$PROGRAM_NAME:*"

echo ""
echo -e "${GREEN}Workers started successfully${NC}"
echo ""
echo "Current status:"
supervisorctl status "$PROGRAM_NAME:*"
