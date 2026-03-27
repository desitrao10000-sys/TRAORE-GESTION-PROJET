#!/bin/bash
# Démarrage persistant du serveur NGP
cd /home/z/my-project

while true; do
    echo "[$(date)] Starting NGP server..." >> /tmp/ngp-persistent.log
    node node_modules/.bin/next dev -p 3000 2>&1 | tee -a /tmp/ngp-persistent.log
    echo "[$(date)] Server stopped, restarting in 3s..." >> /tmp/ngp-persistent.log
    sleep 3
done
