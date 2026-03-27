#!/bin/bash
# NGP Server Start Script - Maintains server stability
cd /home/z/my-project

while true; do
    echo "[$(date)] Starting NGP server with webpack..."
    bun --bun run dev
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE"
    if [ $EXIT_CODE -ne 0 ]; then
        echo "[$(date)] Restarting in 3 seconds..."
        sleep 3
    else
        echo "[$(date)] Clean exit, stopping restart loop."
        break
    fi
done
