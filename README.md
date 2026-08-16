#  MindHarbor — Plateforme de soutien en santé mentale

> **Projet Hackathon 88H — Service Web (Session Été 2026)**  
> Application web full-stack développée entièrement en **TypeScript** pour le suivi du bien-être personnel, l'accès à des ressources adaptées et le soutien communautaire sécurisé.

---

## 👥 Équipe de développement
* **Membre 1** : Fadhel Smari
* **Membre 2** : Gabriel Cadieux

---

## 🏗️ Architecture du projet & Pile technologique

Le projet est structuré sous forme de deux applications distinctes situées dans le même dépôt :
* **Backend** : Node.js, Express, Prisma ORM, PostgreSQL (Neon), JWT (`jsonwebtoken`, `bcryptjs`).
* **Frontend** : React, Vite, Axios (instance centralisée & typée), React Router DOM.

```text
mindharbor/
├───README.md
├───REMISE.md
│   
├───backend
│   │   .gitignore
│   │   package-lock.json
│   │   package.json
│   │   prisma.config.ts
│   │   tsconfig.json
│   │   
│   ├───prisma
│   │       schema.prisma
│   │       
│   ├───src
│   │   │   server.ts
│   │   │   
│   │   ├───middlewares
│   │   │       auth.ts
│   │   │       
│   │   └───routes
│   │           activities.routes.ts
│   │           auth.routes.ts
│   │           groups.routes.ts
│   │           journal.routes.ts
│   │           me.routes.ts
│   │           messages.routes.ts
│   │           posts.routes.ts
│   │           resources.routes.ts
│   │           users.routes.ts
│   │           
│   └───utils
│           paginate.ts
│           prisma.ts
│           
└───frontend
    │   .gitignore
    │   eslint.config.js
    │   index.html
    │   package-lock.json
    │   package.json
    │   README.md
    │   tsconfig.app.json
    │   tsconfig.json
    │   tsconfig.node.json
    │   vite.config.ts
    │   
    ├───public
    │       favicon.svg
    │       icons.svg
    │       
    └───src
        │   App.css
        │   App.tsx
        │   index.css
        │   main.tsx
        │   
        ├───api
        │       auth.ts
        │       axios.ts
        │       groups.ts
        │       journal.ts
        │       resources.ts
        │       
        ├───components
        │       AffichageErreur.tsx
        │       AideUrgence.tsx
        │       ChampFormulaire.tsx
        │       IndicateurChargement.tsx
        │       Pagination.tsx
        │       
        ├───context
        │       AuthContext.tsx
        │       
        ├───pages
        │       Accueil.tsx
        │       Connexion.tsx
        │       DetailGroupe.tsx
        │       Groupes.tsx
        │       Inscription.tsx
        │       Journal.tsx
        │       Messagerie.tsx
        │       Profil.tsx
        │       TableauDeBord.tsx
        │       
        └───types
                index.ts

```

## ⚙️ Guide d'installation et Démarrage rapide
### Prérequis & Clonage
Assurez-vous d'avoir Node.js (LTS)installé sur votre machine.

```Bash
git clone [https://github.com/votre-compte/mindharbor.git](https://github.com/votre-compte/mindharbor.git)
cd mindharbor
```

## 🛠️ Partie 1 : Backend (API REST)

### 1. Installation des dépendances
```Bash
cd backend
npm install
```
### 2. Configuration des variables d'environnement (.env)
Créez un fichier .env à la racine du dossier backend/ à partir de .env.example :

```Bash
DATABASE_URL="postgresql://neondb_owner:votre_lien_neon@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="votre_secret_jwt_super_securise"
PORT=3000

```
- Pour générer une clé de sécurité JWT_SECRET robuste, exécutez la commande suivante dans votre terminal :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- Copiez le résultat obtenu et complétez votre fichier .env

### 3. Migration de la base de données et génération de Prisma
- Créez les tables correspondantes dans votre instance Neon et générez votre client Prisma personnalisé :

```bash
npx prisma migrate dev --name init
npx prisma generate
```
### 4. Lancement du serveur backend
- Démarrez le serveur de développement:

```bash
npm run dev
```
Le serveur s'exécutera sur http://localhost:3000/
---

## 💻 Partie 2 : Frontend (Client React)
### 1. Installation des dépendances
Ouvrez un nouveau terminal et naviguez dans le dossier client :

```bash
cd frontend
npm install
```

### 2. Configuration des variables d'environnement (.env)
Créez un fichier .env dans le dossier frontend/ à partir de .env.example :
```bash
VITE_API_URL="http://localhost:3000/
```

### 3. Lancement de l'application cliente
```bash
npm run dev
```
L'application web sera accessible à l'adresse http://localhost:5173

---

## 📋 Liste des Routes

```text
===================================================================
1. Authentification & Profil (/auth, /me)
===================================================================
POST   /auth/register          -> Inscription d'un utilisateur
POST   /auth/login             -> Connexion (Retourne Access & Token)
GET    /auth/me                -> Profil de l'utilisateur connecté
DELETE /me                     -> Suppression du compte utilisateur

===================================================================
2. Journal de bien-être
===================================================================
GET    /journal                -> Liste paginée de mes entrées de journal (Privé)       
POST   /journal                -> Enregistrer l'entrée du jour (Limité à 1 entrée/jour par  utilisateur)
GET    /journal/:date          -> Consultation d'une entrée spécifique par date (YYYY-MM-DD)
PATCH  /journal/:date          -> Modification d'une entrée (Autorisé jusqu'à minuit le jour même)
DELETE /journal/:date          -> Supprimer une entrée de journal spécifique
GET    /journal/stats          -> Calcul des moyennes et agrégats (sur 7, 30 ou 90 jours)

===================================================================
3. Ressources & Favoris (/resources, /activities)
===================================================================
GET    /activities             -> Catalogue des activités du journal
GET    /resources              -> Liste, recherche et filtres des ressources
GET    /resources/:id          -> Fiche détaillée d'une ressource
POST   /resources              -> Création d'une ressource officielle (Admin seulement)
POST   /resources/:id/favorite -> Ajouter une ressource aux favoris
DELETE /resources/:id/favorite -> Retirer une ressource des favoris
GET    /me/favorites           -> Obtenir la liste de mes favoris
GET    /me/suggestions         -> Suggestions contextuelles

===================================================================
4. Groupes de soutien & Publications (/groups, /posts)
===================================================================
GET    /groups                        -> Liste des groupes publics et recherche par mots-clés
POST   /groups                        -> Création d'un nouveau groupe de soutien
GET    /groups/:id                    -> Aperçu ou contenu détaillé d'un groupe selon le statut d'adhésion
POST   /groups/:id/join               -> Rejoindre un groupe ou envoyer une demande d'adhésion 
GET    /groups/:id/requests           -> Consultation des demandes d'adhésion en attente (Modérateur)
PATCH  /groups/:id/requests/:requestId -> Accepter ou refuser une demande d'adhésion (Modérateur)
DELETE /groups/:id/members/:userId    -> Exclure un membre d'un groupe (Modérateur)
GET    /groups/:id/posts              -> Consulter le fil des publications d'un groupe (Membres seulement)
POST   /groups/:id/posts              -> Publier un message dans le groupe (Membres seulement)
DELETE /posts/:id                     -> Supprimer une publication (Auteur ou Modérateur du groupe)
POST   /posts/:id/comments            -> Ajouter un commentaire sur une publication (Membres seulement)

===================================================================
5. Messagerie privée (/messages)
===================================================================
GET    /messages               -> Liste des conversations actives
GET    /messages/:userId       -> Consulter l'historique d'un fil de discussion
POST   /messages/:userId       -> Envoyer un message privé (Vérification du niveau de contact)

===================================================================

===================================================================
6. PROFIL, VISIBILITÉ ET CONFIDENTIALITÉ (/users, /me)
===================================================================
GET    /users/:id               -> Consultation d'un profil (Filtré selon le niveau de visibilité)
PATCH  /me                      -> Modification du profil (Pseudonyme, biographie, avatar)
PATCH  /me/privacy              -> Modification des préférences de visibilité et de niveau de contact
DELETE /me                      -> Suppression définitive du compte (Cascade ou anonymisation)

===================================================================
```

## 🗄️ Modélisation BDD & Choix d'ingénierie

Justification des contraintes & Index Prisma

* Contrainte d'unicité quotidienne (`@@unique([userId, date])`) : Garantit au niveau du moteur PostgreSQL qu'un utilisateur ne peut soumettre qu'une seule entrée de journal par date donnée, évitant ainsi les doublons et assurant la cohérence des agrégations de données chronologiques.
* Clés primaires composées (`@@id([journalEntryId, activityId])` & `@@id([userId, resourceId])`) : Optimisent les tables de jonction (`JournalActivity` et `Favorite`) en empêchant les doublons d'associations (ex: aimer deux fois la même ressource) tout en évitant la surconsommation d'index inutiles par des identifiants secondaires.
* Unicité des adhésions aux groupes (`@@unique([groupId, userId])`) : Assure qu'un utilisateur ne peut effectuer qu'une seule demande ou détenir qu'un seul statut de membre au sein d'un même groupe de soutien.
* Indexation de la messagerie (`@@index([expediteurId, receveurId])`) : Accélère les requêtes de recherche, de tri chronologique et d'affichage des fil de conversations privées entre deux utilisateurs spécifiques.
* Gestion des suppressions (`onDelete: Cascade`) : Garantit le nettoyage automatique et l'intégrité référentielle complète lors de la suppression d'un compte utilisateur (`DELETE /me`) ou d'une ressource parente (suppression en cascade des journaux, favoris, commentaires, messages et adhésions).

---

## 🎨 Interface & Fonctionnalités (Frontend)

L'application cliente est développée avec React et Vite. Elle s'appuie sur un système de composants réutilisables, un contexte global d'authentification (`AuthContext`), ainsi que des contrôles d'accès pour garantir la confidentialité des données personnelles.

---

### 📄 Pages principales (`src/pages/`)

* **`Accueil.tsx`** : Page de bienvenue et d'orientation présentant l'objectif de MindHarbor, la mise en avant des ressources de soutien et un accès immédiat aux services d'urgence.
* **`TableauDeBord.tsx`** : Vue d'ensemble personnalisée pour l'utilisateur connecté (résumé de l'état émotionnel récent, rappels de saisie pour le journal et raccourcis vers les activités).
* **`Journal.tsx`** : Interface de saisie quotidienne et de suivi personnel. Permet de consigner ses indicateurs de bien-être (humeur, sommeil, anxiété, énergie), d'associer des activités et de consulter son historique de manière strictement confidentielle.
* **`Groupes.tsx` & `DetailGroupe.tsx`** : Espace communautaire permettant de découvrir les groupes de soutien, d'y adhérer, de consulter les publications et d'échanger avec d'autres membres dans un cadre modéré.
* **`Messagerie.tsx`** : Fil de discussions privées entre utilisateurs autorisés, respectant les préférences de confidentialité de chacun.
* **`Profil.tsx`** : Gestion des paramètres du compte, préférences de visibilité du profil, exportation des données personnelles (JSON) et option de suppression définitive du compte.
* **`Connexion.tsx` & `Inscription.tsx`** : Formulaires d'authentification sécurisés avec validation des champs et gestion automatique des jetons de session (JWT).

---

### 🧩 Composants réutilisables (`src/components/`)

* **`AideUrgence.tsx`** : Bouton et modal d'assistance d'urgence accessibles à tout moment sur l'application, fournissant un accès direct aux lignes de crise et numéros d'écoute.
* **`Pagination.tsx`** : Composant de navigation générique pour la gestion des listes volumineuses (entrées de journal, messages, ressources).
* **`IndicateurChargement.tsx`** : Composant visuel d'attente lors du chargement des données depuis l'API.
* **`AffichageErreur.tsx`** : Gestionnaire d'affichage bienveillant pour traiter les erreurs réseau ou de validation des formulaires.
* **`ChampFormulaire.tsx`** : Champ de saisie modulaire intégrant la gestion du typage, des étiquettes et des messages d'erreur.

---

### 🔐 Authentification & Services API (`src/context/` & `src/api/`)

* **`AuthContext.tsx`** : Contexte React gérant l'état global de l'utilisateur connecté, la persistance de session et les méthodes de connexion/déconnexion.
* **`axios.ts`** : Instance Axios centralisée configurée avec l'URL de base (`VITE_API_URL`) et des intercepteurs pour injecter l'Access Token JWT et gérer le rafraîchissement automatique.
* **Modules d'API typés (`src/api/`)** : `auth.ts`, `journal.ts`, `groups.ts`, et `resources.ts` pour isoler les appels réseau et garantir le typage fort via `src/types/index.ts`.


---

