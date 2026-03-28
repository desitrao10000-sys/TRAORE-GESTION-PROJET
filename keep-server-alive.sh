#!/bin/bash
# Script pour maintenir le serveur Next.js actif
cd /home/z/my-project

while true; do
    echo "Starting Next.js server at $(date)"
    bun run dev >> /home/z/my-project/dev.log 2>&1
    echo "Server stopped at $(date), restarting in 2 seconds..."
    sleep 2
done
