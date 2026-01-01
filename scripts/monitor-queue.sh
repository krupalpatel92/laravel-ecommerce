#!/bin/bash

# Laravel Queue Worker - Monitoring Script
# Health check script for queue workers
# Can be used manually or via cron for automated monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_FAILED_JOBS=10
MAX_QUEUE_SIZE=100
ALERT_EMAIL="${ALERT_EMAIL:-}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_PATH="$( cd "$SCRIPT_DIR/.." && pwd )"
LOG_FILE="$PROJECT_PATH/storage/logs/queue-monitor.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Alert function
alert() {
    local message="$1"
    log "ALERT: $message"

    # Send email alert if configured
    if [ ! -z "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Laravel Queue Alert" "$ALERT_EMAIL" 2>/dev/null || true
    fi
}

echo -e "${BLUE}Laravel Queue Monitoring${NC}"
echo "===================================="
log "Starting queue health check"

# Check if Supervisor is running
if ! command -v supervisorctl &> /dev/null; then
    alert "Supervisor is not installed"
    exit 1
fi

# Detect which program should be running
PROGRAM_NAME=""
if [ -f "/etc/supervisor/conf.d/laravel-worker-production.conf" ]; then
    PROGRAM_NAME="laravel-worker-production"
elif [ -f "/etc/supervisor/conf.d/laravel-worker-staging.conf" ]; then
    PROGRAM_NAME="laravel-worker-staging"
elif [ -f "/etc/supervisor/conf.d/laravel-worker.conf" ]; then
    PROGRAM_NAME="laravel-worker"
else
    alert "No Laravel worker configuration found"
    exit 1
fi

# Check worker status
WORKER_STATUS=$(supervisorctl status "$PROGRAM_NAME:*" 2>&1 || echo "ERROR")

if echo "$WORKER_STATUS" | grep -q "ERROR"; then
    alert "Failed to get worker status from Supervisor"
    exit 1
fi

# Count running workers
RUNNING_COUNT=$(echo "$WORKER_STATUS" | grep -c "RUNNING" || echo "0")
STOPPED_COUNT=$(echo "$WORKER_STATUS" | grep -c "STOPPED\|FATAL\|EXITED" || echo "0")

log "Running workers: $RUNNING_COUNT"
log "Stopped workers: $STOPPED_COUNT"

if [ "$RUNNING_COUNT" -eq 0 ]; then
    alert "No workers are running! Queue processing is stopped."
    echo -e "${RED}CRITICAL: No workers running${NC}"
else
    echo -e "${GREEN}Workers running: $RUNNING_COUNT${NC}"
fi

# Change to project directory
cd "$PROJECT_PATH"

# Check failed jobs count
FAILED_JOBS=$(php artisan queue:failed --json 2>/dev/null | grep -c '"id"' || echo "0")
log "Failed jobs: $FAILED_JOBS"

if [ "$FAILED_JOBS" -gt "$MAX_FAILED_JOBS" ]; then
    alert "High number of failed jobs: $FAILED_JOBS (threshold: $MAX_FAILED_JOBS)"
    echo -e "${YELLOW}WARNING: $FAILED_JOBS failed jobs${NC}"
else
    echo -e "${GREEN}Failed jobs: $FAILED_JOBS${NC}"
fi

# Check queue size (requires database connection)
QUEUE_SIZE=$(php artisan tinker --execute="echo DB::table('jobs')->count();" 2>/dev/null | tail -1 || echo "0")
log "Pending jobs in queue: $QUEUE_SIZE"

if [ "$QUEUE_SIZE" -gt "$MAX_QUEUE_SIZE" ]; then
    alert "Large queue backlog: $QUEUE_SIZE jobs (threshold: $MAX_QUEUE_SIZE)"
    echo -e "${YELLOW}WARNING: $QUEUE_SIZE pending jobs${NC}"
else
    echo -e "${GREEN}Pending jobs: $QUEUE_SIZE${NC}"
fi

# Check worker log for recent errors
RECENT_ERRORS=$(tail -n 100 "$PROJECT_PATH/storage/logs/worker.log" 2>/dev/null | grep -c "ERROR\|CRITICAL\|Exception" || echo "0")
log "Recent errors in worker log: $RECENT_ERRORS"

if [ "$RECENT_ERRORS" -gt 5 ]; then
    echo -e "${YELLOW}WARNING: $RECENT_ERRORS recent errors in worker log${NC}"
else
    echo -e "${GREEN}Recent errors: $RECENT_ERRORS${NC}"
fi

# Check if workers are processing jobs (log should be recent)
if [ -f "$PROJECT_PATH/storage/logs/worker.log" ]; then
    LOG_AGE=$(( $(date +%s) - $(stat -f %m "$PROJECT_PATH/storage/logs/worker.log" 2>/dev/null || stat -c %Y "$PROJECT_PATH/storage/logs/worker.log" 2>/dev/null || echo 0) ))
    log "Worker log last modified: $LOG_AGE seconds ago"

    if [ "$LOG_AGE" -gt 300 ] && [ "$QUEUE_SIZE" -gt 0 ]; then
        alert "Worker log not updated in $LOG_AGE seconds, but queue has jobs"
        echo -e "${YELLOW}WARNING: Workers may not be processing jobs${NC}"
    fi
fi

echo ""
log "Health check completed"

# Exit with error code if critical issues found
if [ "$RUNNING_COUNT" -eq 0 ]; then
    exit 1
fi

exit 0
