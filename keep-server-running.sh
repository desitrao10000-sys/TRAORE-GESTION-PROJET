#!/bin/bash
# Script pour maintenir le serveur NGP en fonctionnement

cd /home/z/my-project

while true; do
    echo "[$(date)] Starting NGP server..."
    bun --bun run dev 2>&1
    echo "[$(date)] Server exited, restarting in 2 seconds..."
    sleep 2
done
