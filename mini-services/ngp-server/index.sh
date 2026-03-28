#!/bin/bash
# NGP Server - Mini service pour maintenir le serveur Next.js actif
# Utilise webpack pour plus de stabilité

cd /home/z/my-project

echo "[$(date)] Starting NGP server service with webpack..." >> /tmp/ngp-service.log

while true; do
    # Vérifier si le serveur tourne
    if ! pgrep -f "next-server" > /dev/null; then
        echo "[$(date)] Server not running, starting with webpack..." >> /tmp/ngp-service.log
        # Use webpack instead of turbopack for more stability
        npx next dev -p 3000 --webpack >> /tmp/ngp-service.log 2>&1 &
        sleep 8
    fi
    sleep 3
done
