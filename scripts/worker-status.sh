#!/bin/bash

# Laravel Queue Worker - Status Script
# Check status of all queue workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Laravel Queue Worker Status${NC}"
echo "===================================="
echo ""

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

# Get worker status
echo -e "${GREEN}Supervisor Status:${NC}"
supervisorctl status "$PROGRAM_NAME:*"

echo ""
echo -e "${GREEN}Queue Statistics:${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_PATH="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check failed jobs count
cd "$PROJECT_PATH"
FAILED_JOBS=$(php artisan queue:failed --json 2>/dev/null | grep -c "id" || echo "0")

echo "Failed jobs: $FAILED_JOBS"

# Check if queue:monitor is available (Laravel 11+)
if php artisan list | grep -q "queue:monitor"; then
    echo ""
    php artisan queue:monitor 2>/dev/null || true
fi

echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:       tail -f $PROJECT_PATH/storage/logs/worker.log"
echo "  Restart workers: sudo bash $SCRIPT_DIR/restart-workers.sh"
echo "  Stop workers:    sudo bash $SCRIPT_DIR/stop-workers.sh"
echo "  Failed jobs:     php artisan queue:failed"
echo "  Retry failed:    php artisan queue:retry all"
