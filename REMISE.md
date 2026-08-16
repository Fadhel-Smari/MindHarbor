# Remise — Hackathon MindHarbor

**Cours :** Service Web — Groupe 25604 — Session Été 2026  
**Équipe :** Fadhel-Gabriel  
**Date de remise :** 2026-08-16  

---

## 1. Dépôt GitHub

- **URL (public) :** https://github.com/Fadhel-Smari/MindHarbor  
- **Commit final à corriger :** 0b31abc7bd505eeb6754d8b35de088c738839426
- **Branche :** main
- [X] Vérifié en navigation privée : le dépôt est bien **PUBLIC**.

---

## 2. Membres de l'équipe

| # | Prénom | Nom | Courriel | Compte GitHub |
|---|--------|-----|----------|---------------|
| 1 | Fadhel | Smari | smarifadhel@gmail.com | Fadhel-Smari |
| 2 | Gabriel | Cadieux | gabrielcadieux96@gmail.com | Gabriel-Cadieux |


---

## 3. Comptes de démonstration

| Rôle | Courriel | Mot de passe | Particularité |
|------|----------|--------------|---------------|
| Administrateur | `admin@mindharbor.ca` | `Admin123!` | Accès complet |
| Modérateur | `moderateur@mindharbor.ca` | `Mod12345!` | Modère le groupe "Apprivoiser l'anxiété" |
| Utilisateur | `lea@example.com` | `User1234!` | - |
| Utilisateur | `tom@example.com` | `User1234!` | Profil privé |

---

## 4. État du projet

### Noyau obligatoire

| Fonctionnalité | État | Remarque |
|----------------|------|----------|
| Journal de bien-être | complet | Validation stricte à 1 entrée/jour et restriction d'édition jusqu'à minuit |
| Analyse et tendances | partiel | Calcul des moyennes (7, 30, 90 jours) |
| Ressources et favoris | partiel | Recherche, filtres par catégorie, ajout en favoris |
| Groupes de soutien | complet | Groupes publics/privés, modération des demandes et gestion du fil de discussion |
| Messagerie et confidentialité | complet | Filtre sur les niveaux de visibilité (TOUS, MEMBRES_GROUPES, PERSONNE) |
| Profils et visibilité | complet | Modification du profil, paramétrage de confidentialité et suppression de compte |
| Tableau de bord | partiel | Vue synthétique et raccourcis d'action |
| Administration | absent | |

### Extensions réalisées

* **Intégration d'un composant d'aide d'urgence** (`AideUrgence.tsx`) disponible en permanence pour fournir un accès rapide aux ressources d'assistance immédiate.
* **Composants d'interface personnalisés** (`AffichageErreur.tsx`, `IndicateurChargement.tsx`, `Pagination.tsx`) pour une expérience utilisateur fluide et tolérante aux erreurs.

### Non terminé / limitations connues

* Le module d'administration dédié (`/admin`) n'a pas été implémenté.
* La fonctionnalité de signalement des publications/utilisateurs côté backend est absente.
* L'exportation complète des données au format JSON (`/me/export`).

---

## 5. Notre part de créativité

Bien que le projet ne soit pas totalement achevé et qu'il manque l'espace d'administration, nous avons concentré nos efforts sur la solidité de ce qui a été livré :
- **Sécurisation stricte des routes** : Mise en place de middlewares d'authentification et de vérification d'accès rigoureux sur le backend Express pour isoler scrupuleusement les données privées des utilisateurs.
- **Simplicité et clarté de l'interface** : Un design épuré axé sur la sérénité avec React et CSS, facilitant la navigation sans surcharge visuelle.
- **Composants d'assistance immédiate** : Intégration d'un composant d'urgence dédié (`AideUrgence.tsx`) accessible rapidement pour soutenir l'utilisateur en cas de besoin, respectant l'esprit bienveillant de la plateforme.

---

## 6. Vérifications avant dépôt

- [X] `npx tsc --noEmit` passe sans erreur dans `server/` **et** dans `client/`
- [X] Le projet s'installe et démarre en suivant le README, sur une machine vierge
- [ ] La base Neon est peuplée et restera accessible après la remise
- [X] Aucun fichier `.env` n'est commité ; les `.env.example` sont présents
- [ ] Le scénario de validation de l'énoncé a été déroulé en entier
- [X] Le dépôt est public et le lien ci-dessus fonctionne en navigation privée
