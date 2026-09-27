# 4YM | Maison — Plateforme E-Commerce & Système de Gestion COD

Bienvenue sur le projet officiel de **4YM | Maison**, boutique de luxe marocaine spécialisée dans les bijoux, montres minimalistes et maroquinerie d'exception.

Ce projet est une application full-stack moderne (React 19 + TypeScript + Express + Tailwind CSS v4) intégrant une gestion complète du paiement à la livraison (**Cash On Delivery au Maroc**) et un **panneau d'administration centralisé** comme unique source de vérité, sans dépendance externe.

---

## 1. Prérequis Système

Avant de lancer le projet localement, assurez-vous d'avoir installé :

* **Node.js** : Version 18.18+ ou 20+ recommandée (`node -v`)
* **npm** : Version 9+ ou supérieure (`npm -v`)
* **Git** pour le clonage du dépôt

---

## 2. Installation Rapide en Local

### Étape 1 : Cloner et installer les dépendances

```bash
# 1. Accédez au répertoire du projet
cd 4ym-maison

# 2. Installez les dépendances npm
npm install
```

### Étape 2 : Configurer les Variables d'Environnement

Copiez le fichier d'exemple pour créer votre fichier `.env` local :

```bash
cp .env.example .env
```

Contenu par défaut du fichier `.env` :

```env
# Port du serveur Express et Vite
PORT=3000
NODE_ENV=your-environment
APP_URL="http://localhost:3000"

# Identifiants du compte Administrateur
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="your-admin-password"

# Clé API optionnelle (si extension IA future)
GEMINI_API_KEY="MY_GEMINI_API_KEY"
```

---

## 3. Base de Données & Auto-Initialisation

L'application utilise un système de persistance autonome et sécurisé situé dans `/data/4ym_store.json`.

* **Aucun serveur de base de données externe requis** (pas besoin de Docker, MySQL ou PostgreSQL pour développer et tester localement).
* **Auto-Amorçage (Auto-Seed)** : Au premier démarrage, l'application initialise automatiquement :
  * Les 4 catégories signatures (Bijoux & Or, Montres, Accessoires, Nouveautés).
  * 6 produits de luxe complets avec visuels haute fidélité, stocks, références SKU et fiches matières.
  * Des commandes de démonstration réalistes à Casablanca, Rabat, Marrakech et Tanger.
  * Les paramètres de livraison gratuite partout au Maroc.
* **Intégrité transactionnelle** : Écritures atomiques avec fichiers temporaires (`.tmp`) pour éviter toute corruption des données en cas d'arrêt imprévu.

---

## 4. Lancement en Mode Développement

Démarrez le serveur complet (Express backend + Vite middleware) :

```bash
npm run dev
```

L'application sera accessible immédiatement sur :
* **Boutique Publique** : [http://localhost:3000](http://localhost:3000)
* **Panneau d'Administration** : [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 5. Compte Administrateur & Connexion

Accédez à [http://localhost:3000/admin](http://localhost:3000/admin) avec les identifiants par défaut :

| Champ | Valeur par défaut |
| :--- | :--- |
| **Identifiant / Email** | `your-admin-email` (ou `admin`) |
| **Mot de Passe** | `your-admin-password` (ou `admin`) |

> **Personnalisation** : Vous pouvez changer ces identifiants à tout moment dans votre fichier `.env` (`ADMIN_EMAIL` et `ADMIN_PASSWORD`) ou directement depuis l'onglet **Paramètres** de l'admin.

---

## 6. Guide de Test Local du Workflow COD

Pour tester l'intégralité du cycle de vie d'une commande en local :

1. **Passer une Commande Test (Côté Client)** :
   * Rendez-vous sur `http://localhost:3000`.
   * Cliquez sur une pièce (ex: *Bracelet Manchette Or Sculpté*) puis sur **Commander (COD)** ou **Ajouter au Panier**.
   * Remplissez le formulaire COD marocain :
     * Nom complet : *Ex. Youssef Bennani*
     * Téléphone : *06 12 34 56 78*
     * Ville : *Casablanca*
     * Adresse : *Gauthier, 14 Rue Jean Jaurès*
   * Cliquez sur **CONFIRMER LA COMMANDE**.
   * Une page de confirmation s'affiche avec le numéro généré `#4YM-XXXX`.

2. **Validation & Suivi (Côté Admin)** :
   * Ouvrez l'Admin sur `http://localhost:3000/admin`.
   * Allez dans l'onglet **Commandes COD**.
   * La commande apparaît instantanément sous l'onglet **🟡 New Orders**.
   * Cliquez sur **CONFIRMER** ou ouvrez la fiche commande et cliquez sur le bouton principal **CONFIRM ORDER**.
   * L'écran de confirmation interne s'affiche :
     * `✓ Order Confirmed Successfully`
     * Bouton **CONTACT CUSTOMER** : ouvre WhatsApp avec le numéro du client et le message pré-rempli (nom, numéro de commande, article, total en DH).
     * Bouton **VIEW ORDER** : affiche la fiche détaillée de la commande.
     * Bouton **BACK TO ORDERS** : bascule vers l'onglet **🔵 Confirmed**.
   * Vous pouvez ensuite faire progresser le statut vers **🟠 Preparing** $\to$ **🚚 Shipped** $\to$ **✅ Delivered**.

3. **Vérification du Stock** :
   * Chaque commande validée décrémente automatiquement le stock physique du produit en base de données.
   * Si le stock tombe à 0, le produit passe automatiquement au statut `out_of_stock` et affiche *Rupture de Stock* sur la boutique publique pour empêcher tout sur-achat.

---

## 7. Commandes Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance le serveur Express + Vite dev sur le port 3000 |
| `npm run build` | Compile le frontend React et génère le bundle de production dans `/dist` |
| `npm start` | Démarre le serveur en mode production |
| `npm run lint` | Exécute la vérification TypeScript stricte (`tsc --noEmit`) |
| `npm run clean` | Supprime les dossiers de build (`dist`, etc.) |

---

## 8. Structure du Projet

```text
├── data/
│   └── 4ym_store.json            # Base de données persistante (produits, commandes, paramètres)
├── server/
│   └── db.ts                     # Moteur de données, validation prix/stocks et transactions
├── src/
│   ├── admin/
│   │   └── AdminDashboard.tsx    # Panneau d'administration (commandes, workflow, stats, produits)
│   ├── assets/images/            # Visuels haute fidélité générés (campagnes et produits 4YM)
│   ├── components/
│   │   ├── Navbar.tsx            # Barre de navigation respectant le Top Bar Contract
│   │   ├── Hero.tsx              # Campagne éditoriale "Wear Your Identity"
│   │   ├── FeaturedCategories.tsx# Collections signatures
│   │   ├── ProductCard.tsx       # Carte produit (prix en DH, tags, quick buy)
│   │   ├── ProductDetailModal.tsx# Fiche produit détaillée avec galerie et spécifications
│   │   ├── CODModal.tsx          # Modal de commande COD (Paiement à la livraison)
│   │   ├── CartDrawer.tsx        # Tiroir panier latéral
│   │   ├── BrandStory.tsx        # Section signature "More than an accessory" & réassurances
│   │   ├── InstagramSection.tsx  # Galerie éditoriale @4ym.store
│   │   └── Footer.tsx            # Pied de page luxe avec FAQ et accès admin
│   ├── context/
│   │   └── StoreContext.tsx      # Gestion de l'état global du panier et de la boutique
│   ├── services/
│   │   └── api.ts                # Client API pour le storefront et l'administration
│   ├── types.ts                  # Définitions TypeScript (produits, commandes, statuts)
│   ├── App.tsx                   # Composant racine et routage
│   ├── main.tsx                  # Point d'entrée React
│   └── index.css                 # Configuration Tailwind CSS v4 et typographies
├── .env.example                  # Modèle des variables d'environnement
├── server.ts                     # Serveur Express full-stack et routes API
├── package.json                  # Dépendances et scripts
└── tsconfig.json                 # Configuration TypeScript
```
