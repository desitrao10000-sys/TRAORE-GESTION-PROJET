#!/bin/bash
# Boucle infinie pour maintenir le serveur actif
cd /home/z/my-project
while true; do
    node node_modules/.bin/next dev -p 3000
    sleep 2
done
