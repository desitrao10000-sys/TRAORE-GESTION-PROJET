# Cahier de Charge - Analyse de l'Application

## 📊 Tableau de Synthèse

| # | Fonctionnalité | Réponse Client | Statut | Priorité |
|---|----------------|----------------|--------|----------|
| **1. STRUCTURE & PROJETS** |
| 1 | Vue "Dossiers" pour grouper projets | Oui | ✅ **FAIT** | - |
| 2 | Projets à partir de modèles types | Oui | ❌ **À FAIRE** | Haute |
| 3 | Archivage projets terminés | Oui | ⚠️ **PARTIEL** | Haute |
| 4 | Phases & Jalons / Chronogramme | Tâches hiérarchisées | ❌ **À FAIRE** | Haute |
| **2. VUES & TÂCHES** |
| 5 | Multi-vues (Kanban, Liste, Calendrier) | Oui | ⚠️ **PARTIEL** (Kanban OK) | Haute |
| 6 | Sous-tâches | 1 niveau | ❌ **À FAIRE** | Moyenne |
| 7 | Dépendances entre tâches | Non | ✅ **NON REQUIS** | - |
| 8 | Champs personnalisés (objectifs, temps, responsable, statut, contraintes) | Oui | ⚠️ **PARTIEL** | Haute |
| 9 | Tâches récurrentes | Non | ✅ **NON REQUIS** | - |
| **3. TEMPS & PLANNING** |
| 10 | Minuteur Start/Stop | Oui | ❌ **À FAIRE** | Haute |
| 11 | Vue charge de travail | Oui | ✅ **FAIT** | - |
| 12 | Vue Gantt | Oui | ❌ **À FAIRE** | Haute |
| **4. COMMUNICATION & RAPPELS** |
| 13 | Notifications email quotidien | Email matin | ❌ **À FAIRE** | Haute |
| 14 | Mentions (@Moi) | Oui | ❌ **À FAIRE** | Moyenne |
| 15 | Historique complet (traçabilité) | Oui | ❌ **À FAIRE** | Moyenne |
| **5. DOCUMENTS & IA** |
| 16 | Fichiers (PDF/Excel) sur tâches | Oui | ❌ **À FAIRE** | Haute |
| 17a | Import IA (PDF → Tâches en brouillon) | Brouillon à valider | ⚠️ **PARTIEL** (UI OK) | Haute |
| 17b | Questionnaire dans l'appli | Oui | ❌ **À FAIRE** | Haute |
| 18 | Wiki/Notes par projet | Commentaires sur tâches | ❌ **À FAIRE** | Moyenne |
| **7. RISQUES, QUALITÉ & RAPPORTS** |
| 22 | Onglet Risques (Probabilité x Impact) | Oui | ⚠️ **PARTIEL** | Haute |
| 23 | Causes de retard (classification) | Oui | ❌ **À FAIRE** | Moyenne |
| 24 | Dashboard (Tâches en cours, réalisées, retard, contraintes, délai) | Oui | ⚠️ **PARTIEL** | Haute |
| **8. ACCÈS & MOBILITÉ** |
| 25 | App mobile/tablette | Téléphone + Tablette | ❌ **À FAIRE** | Haute |
| 26 | Mode hors-ligne | Non | ✅ **NON REQUIS** | - |
| 27 | TODO List globale journalière | Oui | ❌ **À FAIRE** | Haute |
| 28 | Dashboard par projet + global | Oui | ⚠️ **PARTIEL** | Moyenne |
| 29 | Mot de passe pour l'appli | Oui | ❌ **À FAIRE** | Haute |
| 30 | Suivi dépenses et budgets | Oui | ⚠️ **PARTIEL** | Moyenne |

---

## ✅ CE QUI EST DÉJÀ FAIT (7 points)

1. **Vue "Dossiers"** - Infrastructure, Marketing, Environnement ✅
2. **Vue Kanban des tâches** - Colonnes par statut ✅
3. **Vue charge de travail** - Par utilisateur et projet ✅
4. **Section Risques** - Listing avec sévérité et probabilité ✅
5. **Dashboard global** - KPIs, projets récents, tâches prioritaires ✅
6. **Suivi budget** - Dépenses par projet (structure en place) ✅
7. **Import PDF (UI)** - Interface de glisser-déposer ✅

---

## ⚠️ CE QUI EST PARTIELLEMENT FAIT (6 points)

1. **Archivage projets** - Structure OK, bouton sans action
2. **Multi-vues** - Kanban OK, manque Liste et Calendrier
3. **Champs personnalisés** - Titre, statut, priorité, date OK, manque objectifs, temps exécution, contraintes
4. **Import IA** - UI OK, manque intégration IA réelle
5. **Section Risques** - Affichage OK, manque calcul score (Probabilité x Impact)
6. **Dashboard par projet** - Détail projet OK, manque dashboard dédié
7. **Suivi dépenses** - Affichage OK, manque formulaire d'ajout

---

## ❌ CE QUI RESTE À FAIRE (17 points)

### 🔴 PRIORITÉ HAUTE (11 points)

1. **Modèles de projets** - Créer depuis modèle type
2. **Chronogramme** - Ordonnancement par importance
3. **Vue Liste** - Affichage tableau des tâches
4. **Vue Calendrier** - Tâches sur calendrier
5. **Minuteur Start/Stop** - Chronomètre sur tâches
6. **Vue Gantt** - Barres horizontales temporelles
7. **Notifications email** - Résumé quotidien matin
8. **Fichiers sur tâches** - Upload PDF/Excel
9. **Questionnaire création tâche** - Formulaire complet
10. **TODO List journalière** - Fonctionnalité spéciale
11. **Mot de passe appli** - Sécurisation

### 🟡 PRIORITÉ MOYENNE (6 points)

12. **Sous-tâches (1 niveau)** - Imbrication simple
13. **Mentions (@Moi)** - Auto-mention
14. **Historique** - Traçabilité complète
15. **Commentaires sur tâches** - Discussion
16. **Causes de retard** - Classification
17. **Dashboard par projet** - Dédié à chaque projet

---

## 📱 POINT SPÉCIAL : TODO LIST JOURNALIÈRE (Point 27)

**Format requis :**
- Nom du projet
- Tâches à accomplir
- Délai
- Responsable
- Contrainte
- Proposition de solution

**Actions possibles :**
- Commencer → En cours
- En cours → Valider
- Valider → Tâche ne revient plus

**Rappel :**
- Si non validé le même jour → Rappel à une date choisie

---

## 🚀 PRÉPARATION POUR DÉPLOIEMENT MOBILE

**À prévoir pour installation sur :**
- 📱 Téléphone Android
- 📱 Tablette Android
- 💻 PC Windows

**Technologies recommandées :**
- PWA (Progressive Web App) - Installation depuis navigateur
- Capacités hors-ligne partielles
- Interface responsive adaptée
