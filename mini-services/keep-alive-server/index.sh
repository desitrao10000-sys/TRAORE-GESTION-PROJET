#!/bin/bash
# Script pour maintenir le serveur Next.js actif
# Ce script vérifie toutes les 10 secondes si le serveur répond

LOG_FILE="/home/z/my-project/dev.log"
PID_FILE="/home/z/my-project/.next-server.pid"

echo "[$(date)] Démarrage du système Keep-Alive..." >> "$LOG_FILE"

# Fonction pour tuer les anciens processus
kill_old() {
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    sleep 2
}

# Fonction pour démarrer le serveur
start_server() {
    echo "[$(date)] Démarrage de Next.js..." >> "$LOG_FILE"
    cd /home/z/my-project
    nohup bun run dev >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 5
}

# Fonction pour vérifier si le serveur répond
check_server() {
    curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000 2>/dev/null
}

# Tuer les anciens processus au démarrage
kill_old

# Démarrer le serveur
start_server

# Boucle de surveillance
while true; do
    HTTP_CODE=$(check_server)
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo "[$(date)] Serveur non répondant (HTTP: $HTTP_CODE), redémarrage..." >> "$LOG_FILE"
        kill_old
        start_server
    fi
    
    sleep 10
done
