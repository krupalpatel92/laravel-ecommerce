#!/bin/bash

# Laravel Queue Worker - Supervisor Deployment Script
# This script deploys Supervisor configuration for Laravel queue workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_PATH="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${GREEN}Laravel Queue Worker - Supervisor Deployment${NC}"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if Supervisor is installed
if ! command -v supervisorctl &> /dev/null; then
    echo -e "${RED}Error: Supervisor is not installed${NC}"
    echo "Install it using:"
    echo "  Ubuntu/Debian: sudo apt-get install supervisor"
    echo "  CentOS/RHEL: sudo yum install supervisor"
    exit 1
fi

# Detect environment
ENV="production"
if [ ! -z "$1" ]; then
    ENV="$1"
fi

echo "Environment: $ENV"
echo "Project Path: $PROJECT_PATH"
echo ""

# Select configuration file
if [ "$ENV" == "staging" ]; then
    CONFIG_FILE="$PROJECT_PATH/supervisor/laravel-worker-staging.conf"
    PROGRAM_NAME="laravel-worker-staging"
elif [ "$ENV" == "production" ]; then
    CONFIG_FILE="$PROJECT_PATH/supervisor/laravel-worker-production.conf"
    PROGRAM_NAME="laravel-worker-production"
else
    CONFIG_FILE="$PROJECT_PATH/supervisor/laravel-worker.conf"
    PROGRAM_NAME="laravel-worker"
fi

# Check if configuration file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Error: Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Get current user (the one who ran sudo)
ACTUAL_USER="${SUDO_USER:-$USER}"

echo "Configuration file: $CONFIG_FILE"
echo "Program name: $PROGRAM_NAME"
echo "Running as user: $ACTUAL_USER"
echo ""

# Create temporary file with replaced placeholders
TEMP_FILE=$(mktemp)
sed -e "s|__PROJECT_PATH__|$PROJECT_PATH|g" \
    -e "s|__USER__|$ACTUAL_USER|g" \
    "$CONFIG_FILE" > "$TEMP_FILE"

# Copy to Supervisor configuration directory
SUPERVISOR_CONF_DIR="/etc/supervisor/conf.d"
DEST_FILE="$SUPERVISOR_CONF_DIR/$PROGRAM_NAME.conf"

echo "Copying configuration to: $DEST_FILE"
cp "$TEMP_FILE" "$DEST_FILE"
rm "$TEMP_FILE"

# Set proper permissions
chmod 644 "$DEST_FILE"

echo -e "${GREEN}Configuration file deployed successfully${NC}"
echo ""

# Reload Supervisor configuration
echo "Reloading Supervisor configuration..."
supervisorctl reread

echo ""
echo "Updating Supervisor..."
supervisorctl update

echo ""
echo "Starting workers..."
supervisorctl start "$PROGRAM_NAME:*" || true

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Worker status:"
supervisorctl status "$PROGRAM_NAME:*"

echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  Check status:    sudo supervisorctl status"
echo "  Restart workers: sudo supervisorctl restart $PROGRAM_NAME:*"
echo "  Stop workers:    sudo supervisorctl stop $PROGRAM_NAME:*"
echo "  View logs:       tail -f $PROJECT_PATH/storage/logs/worker.log"
