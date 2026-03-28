#!/bin/bash
# Script pour maintenir le serveur NGP actif

cd /home/z/my-project

while true; do
    # Vérifier si le serveur tourne
    if ! pgrep -f "next-server" > /dev/null; then
        echo "[$(date)] Starting Next.js server..." >> /tmp/ngp-keepalive.log
        bun run dev &
        sleep 10
    fi
    sleep 5
done
