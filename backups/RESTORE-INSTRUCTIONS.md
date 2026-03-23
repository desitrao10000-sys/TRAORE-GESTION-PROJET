# NGP - New Gestion Projet - Instructions de Restauration

## Date de sauvegarde: 23 Mars 2026 - 01:25

## Fichiers de sauvegarde disponibles

| Fichier | Description |
|---------|-------------|
| `ngp-backup-20260323-012436.tar.gz` | Archive complète du projet |
| `database-20260323-012501.db` | Base de données SQLite |

## Comment restaurer le projet

### Option 1: Depuis GitHub (Recommandé)
```bash
git clone https://github.com/desitrao10000-sys/TRAORE-GESTION-PROJET.git
cd TRAORE-GESTION-PROJET
bun install
bun run db:push
bun run dev
```

### Option 2: Depuis l'archive locale
```bash
# Extraire l'archive
tar -xzvf ngp-backup-20260323-012436.tar.gz -C /chemin/vers/nouveau/dossier

# Aller dans le dossier
cd /chemin/vers/nouveau/dossier

# Restaurer la base de données
cp database-20260323-012501.db db/custom.db

# Installer les dépendances
bun install

# Générer Prisma Client
bun run db:push

# Démarrer le serveur
bun run dev
```

## Commandes utiles

```bash
# Vérifier le statut git
git status

# Voir les derniers commits
git log --oneline -10

# Pousser vers GitHub
git push origin main

# Sauvegarde manuelle
./scripts/auto-backup.ts
```

## Dernières modifications

- Vue Gantt: Ligne "Aujourd'hui" positionnée exactement sur le 23 mars
- Vue Gantt: Dates visibles sur les barres des projets et tâches
- Vue Gantt: Bouton "Aujourd'hui" scroll correct vers la date actuelle
- Base de données: Projets et tâches avec dates en 2026

## Accès à l'application

- URL local: http://localhost:3000
- Identifiant: gestionnaire@ngp.com
- Mot de passe: gestionnaire123
