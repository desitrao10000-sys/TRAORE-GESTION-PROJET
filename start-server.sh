#!/bin/bash
# Démarrage persistant du serveur NGP
cd /home/z/my-project

echo "[$(date)] Starting NGP server..." >> /tmp/ngp-persistent.log

while true; do
    if ! pgrep -f "next-server" > /dev/null; then
        echo "[$(date)] Server not running, starting..." >> /tmp/ngp-persistent.log
        npx next dev -p 3000 --webpack >> /tmp/ngp-persistent.log 2>&1 &
        sleep 5
    fi
    sleep 2
done
