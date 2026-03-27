#!/bin/bash
cd /home/z/my-project

# Installer les dépendances si nécessaire
bun install --frozen-lockfile 2>/dev/null || bun install

# Configurer la base de données
bun run db:push

# Vérifier si le build existe, sinon le créer
if [ ! -f ".next/standalone/server.js" ]; then
    echo "Building production version..."
    bun run build
    cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
    cp -r public .next/standalone/ 2>/dev/null || true
fi

# Lancer le serveur de production en premier plan
cd .next/standalone
exec node server.js
