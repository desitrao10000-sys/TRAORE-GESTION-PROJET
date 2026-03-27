#!/bin/bash
# Script de démarrage du serveur NGP
# Ce script doit être exécuté par le système automatiquement

cd /home/z/my-project

# Démarrer le serveur Next.js en premier plan
exec bun run dev
