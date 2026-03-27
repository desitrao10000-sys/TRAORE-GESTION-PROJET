# 🔧 GUIDE DE RÉSOLUTION RAPIDE - ERREUR 502 / ÉCRAN NOIR

## 📋 RÉSUMÉ DU PROBLÈME

**Symptômes identifiés dans les logs console :**
- `502 (Bad Gateway)` sur toutes les requêtes
- `API returned HTML instead of JSON. Server might be unavailable.`
- `Error fetching data: TypeError: Failed to fetch`
- `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Cause racine :** Le serveur Next.js n'est pas en cours d'exécution ou est instable.

---

## 🚀 SOLUTION IMMÉDIATE (3 étapes)

### Étape 1 : Vérifier si le serveur tourne
```bash
ps aux | grep -E "bun|next" | grep -v grep
```
**Résultat attendu :** Une ligne avec `next-server` ou `bun`

### Étape 2 : Redémarrer le serveur si nécessaire
```bash
cd /home/z/my-project
bun run dev &
```

### Étape 3 : Vérifier le bon fonctionnement
```bash
curl -s http://localhost:3000 | head -20
```
**Résultat attendu :** Code HTML de la page (pas d'erreur)

---

## 🔍 DIAGNOSTIC COMPLET

### 1. Vérifier les processus actifs
```bash
# Voir tous les processus Node/Next.js
ps aux | grep -E "bun|next|node" | grep -v grep

# Vérifier le port 3000
lsof -i :3000 2>/dev/null || netstat -tlnp 2>/dev/null | grep 3000
```

### 2. Vérifier les logs du serveur
```bash
# Lire les derniers logs
tail -50 /home/z/my-project/mini-services/app-server.log

# Ou vérifier le processus actif
cat /home/z/my-project/dev.log 2>/dev/null | tail -30
```

### 3. Vérifier la base de données
```bash
# Vérifier que le fichier DB existe
ls -la /home/z/my-project/db/custom.db

# Tester la connexion
cd /home/z/my-project && bun run db:push
```

---

## 📁 FICHIERS DE DÉMARRAGE DISPONIBLES

| Script | Usage |
|--------|-------|
| `start.sh` | Démarrage standard |
| `start-server.sh` | Démarrage serveur persistant |
| `start-persistent.sh` | Démarrage avec persistance |
| `keep-server-alive.sh` | Maintien du serveur actif |
| `keep-alive.sh` | Script de maintien alternatif |
| `server-loop.sh` | Boucle de redémarrage automatique |

### Commande de démarrage recommandée :
```bash
cd /home/z/my-project && bash start-server.sh
```

---

## 🛠️ SCRIPTS DE MINI-SERVICES

Les services de maintien sont dans `/home/z/my-project/mini-services/`:

- **keep-alive** : Maintient le serveur actif
- **keep-alive-server** : Serveur de maintien alternatif
- **ngp-server** : Serveur NGP dédié
- **ngp-app** : Application NGP
- **app-server** : Serveur applicatif principal

### Démarrer le service de maintien :
```bash
cd /home/z/my-project/mini-services/keep-alive && bun run dev &
```

---

## ⚡ CHECKLIST RAPIDE DE RÉSOLUTION

1. ✅ **Serveur actif ?** → `ps aux | grep next`
2. ✅ **Port 3000 libre ?** → `lsof -i :3000`
3. ✅ **Base de données OK ?** → `ls -la db/custom.db`
4. ✅ **Dépendances OK ?** → `bun install`
5. ✅ **Redémarrer** → `bun run dev &`

---

## 🔴 CAS PARTICULIERS

### Écran noir persistant
1. Vérifier que le CSS est bien chargé
2. Vérifier les erreurs JavaScript côté client
3. Essayer en navigation privée
4. Vider le cache navigateur

### Erreur JSON dans les API
- C'est un symptôme du 502 : le serveur renvoie une page HTML d'erreur
- Solution : redémarrer le serveur Next.js

### HMR (Hot Module Replacement) déconnecté
- Le serveur de développement doit être actif
- Redémarrer avec `bun run dev`

---

## 📞 COMMANDES DE SAUVETAGE

### Tout redémarrer proprement :
```bash
# Tuer tous les processus existants
pkill -f "bun run dev" 2>/dev/null
pkill -f "next" 2>/dev/null

# Attendre 2 secondes
sleep 2

# Relancer le serveur
cd /home/z/my-project && bun run dev &

# Vérifier
sleep 5 && curl -s http://localhost:3000 | head -5
```

### Restaurer depuis GitHub :
```bash
cd /home/z/my-project
git fetch origin
git reset --hard origin/main
bun install
bun run db:push
bun run dev &
```

---

## 📊 INFORMATIONS SYSTÈME

- **Port applicatif :** 3000
- **Base de données :** SQLite (`/home/z/my-project/db/custom.db`)
- **GitHub :** https://github.com/desitrao10000-sys/TRAORE-GESTION-PROJET
- **Framework :** Next.js 16 avec App Router

---

## 💡 PRÉVENTION

1. **Toujours sauvegarder** avant modifications majeures
2. **Utiliser les scripts de maintien** pour éviter les arrêts
3. **Vérifier régulièrement** l'état du serveur
4. **Consulter les logs** en cas de comportement anormal

---

*Document créé le 26/03/2026 - Dernière mise à jour après résolution de l'incident 502*
