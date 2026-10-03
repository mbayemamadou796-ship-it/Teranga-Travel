# Architecture des Portails — Teranga Travel

## 1. Vision et Objectifs de la Plateforme

**Teranga Travel** est la plateforme numérique unifiée de valorisation touristique et patrimoniale du Sénégal. Elle rassemble dans un écosystème unique et cohérent l'ensemble des acteurs de la chaîne de valeur touristique sénégalaise :
- Les **voyageurs et touristes** (nationaux et internationaux)
- Les **hébergeurs locaux** (hôtels, campements éco-responsables, auberges, lodges, maisons d'hôtes)
- Les **agences de voyage réceptives et guides touristiques diplômés**
- L'**administration et autorité de régulation** (homologation d'État, modération, sécurité)

Afin d'offrir une expérience utilisateur optimale sans compromis sur la rigueur métier, Teranga Travel s'appuie sur une **architecture multi-portails modulaire**, adossée à une API et une base de données centralisées.

---

## 2. Découpage en 4 Portails Dédiés

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   TERANGA TRAVEL — ÉCOSYSTÈME UNIFIÉ                   │
│          Barre Universelle des Portails & Commutateur de Rôles         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  PORTAIL 1   │             │  PORTAIL 2   │             │  PORTAIL 3   │
│  web-tourist │             │   web-host   │             │ web-circuits │
│ (Voyageurs)  │             │ (Hébergeurs) │             │  (Agences &  │
│              │             │              │             │   Guides)    │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │  PORTAIL 4   │
                             │  web-admin   │
                             │(Supervision) │
                             └──────┬───────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │    BACKEND API & DATA     │
                      │  Authentification Unifiée │
                      │  Homologation & Modération│
                      └───────────────────────────┘
```

### 2.1. Portail 1 : Voyageurs / Touristes (`web-tourist`)
**Objectif :** Vitrine d'attractivité touristique nationale et expérience de réservation fluide.
- **Modules :**
  - **Accueil & Découverte :** Présentation des 5 grandes régions (Dakar, Sine Saloum, Casamance, Saint-Louis, Kédougou) avec conseils locaux, spécialités culinaires et spots emblématiques.
  - **Catalogue Hébergements :** Recherche multi-critères, filtres région/type, visualisation cartographique interactive.
  - **Circuits & Guides :** Réservation d'excursions encadrées par des agences certifiées et des guides locaux accrédités.
  - **Planificateur IA sur mesure :** Génération d'itinéraires personnalisés selon la durée, le budget et le style de voyage.
  - **Communauté Teranga :** Forum d'échange, retours d'expériences, conseils et bonnes adresses entre voyageurs.
  - **Espace Voyageur :** Suivi des réservations confirmées, gestion des favoris et profil voyageur.

### 2.2. Portail 2 : Hébergeurs & Hôteliers (`web-host`)
**Objectif :** Véritable progiciel de gestion d'établissement (PMS léger) sans commission abusive.
- **Modules :**
  - **Tableau de Bord :** Taux d'occupation en temps réel, réservations du jour, chiffre d'affaires cumulé.
  - **Gestion des Chambres & Offres :** Création d'hébergements avec photos, tarifs (standard et promotionnels), capacité et prestations incluses.
  - **Calendrier des Disponibilités :** Blocage/déblocage interactif de dates et ajustement des prix à la journée.
  - **Dossiers Clients & Réservations :** Acceptation ou refus des demandes de réservation, historique des séjours.
  - **Homologation d'Établissement :** Suivi du statut de validation de l'établissement par l'Administration (`approved` / `pending`).

### 2.3. Portail 3 : Agences de Voyage & Guides Touristiques (`web-circuits`)
**Objectif :** Logiciel métier dédié aux voyagistes réceptifs et guides touristiques officiels du Sénégal.
- **Modules :**
  - **Espace Agences :**
    - Création et publication de circuits touristiques (itinéraires multi-jours, randonnées, balades en pirogue, safaris).
    - Dossiers départs par excursion avec liste des voyageurs inscrits et suivi des places restantes.
    - Suivi du chiffre d'affaires et coordination logistique.
  - **Espace Guides :**
    - Profil accrédité avec mention de la carte officielle du Ministère du Tourisme, langues parlées (Wolof, Français, Anglais, Diola, Sérère) et spécialités régionales.
    - Définition du tarif journalier et forfaits d'accompagnement sur-mesure.
    - Calendrier de disponibilité pour les missions de guidage privé ou de groupe.

### 2.4. Portail 4 : Administrateur & Supervision Nationale (`web-admin`)
**Objectif :** Centre de contrôle, de régulation étatique et de sécurité de la plateforme.
- **Modules :**
  - **Homologation des Prestataires :** Examen des nouveaux dossiers hébergeurs, agences et guides (`pending` -> `approved` / `rejected`).
  - **Modération des Offres :** Examen de conformité des chambres et circuits avant mise en ligne sur le portail voyageur, avec motif obligatoire en cas de refus.
  - **Supervision Globale :** Indicateurs nationaux, flux de réservations et répartition par destination.
  - **Gestion des Utilisateurs :** Vue d'ensemble des comptes (touristes, professionnels, administrateurs).
  - **Modération Communauté :** Traitement des signalements sur les avis et publications du forum.

---

## 3. Système d'Authentification Centralisé & Redirection Intelligente

Le système propose un guichet d'authentification unique :
1. **Formulaire de connexion universel :**
   - Identifiant unique (Email + Mot de passe).
   - Lors de la validation, l'API analyse le rôle et l'établissement rattaché pour renvoyer le **portail recommandé** :
     - Rôle `tourist` ➔ Redirection vers `web-tourist`
     - Rôle `professional` (type hôtel, campement, lodge) ➔ Redirection vers `web-host`
     - Rôle `professional` (type agence, guide) ➔ Redirection vers `web-circuits`
     - Rôle `admin` ➔ Redirection vers `web-admin`
2. **Formulaire d'inscription multi-profils :**
   - **Voyageur / Touriste :** Création immédiate avec statut `active`.
   - **Hébergeur / Agence / Guide :** Création avec statut `pending`, notification d'instruction du dossier par l'administrateur et création automatique du profil d'établissement lié.
3. **Barre de Navigation Inter-Portails ("Portail Switcher") :**
   - Présente en permanence au sommet de l'interface.
   - Permet de naviguer librement entre les 4 applications web.
   - Affiche en temps réel l'utilisateur connecté avec son badge métier.
   - Permet de se déconnecter ou de changer de profil de test en un clic.

---

## 4. Comptes de Test et Démonstration Instantanée (Accès 1-Clic)

Pour permettre une évaluation exhaustive et immédiate des différents portails sans saisie manuelle :

| Rôle | Profil / Nom | Identifiant | Mot de passe | Portail cible |
|---|---|---|---|---|
| **Voyageur / Touriste** | Fatou Diop | `tourist@teranga.sn` | `tourist` | `web-tourist` |
| **Hébergeur** | Cheikh Ndiaye (Hôtel Teranga Dakar) | `professional@teranga.sn` | `professional` | `web-host` |
| **Agence de Voyage** | Lamine Sané (Casamance Evasion) | `agency_casamance@teranga.sn` | `agency` | `web-circuits` |
| **Guide Touristique** | Abdoulaye Ndiaye (Guide Dakar/Gorée) | `guide_dakar@teranga.sn` | `guide` | `web-circuits` |
| **Administrateur** | Modou Sow (SYSOP National) | `admin@teranga.sn` | `admin` | `web-admin` |

Les boutons d'accès rapide sont disponibles :
- Dans le modal de connexion centralisé (`dashboard` du portail touristique)
- Sur les écrans d'accueil d'autorisation de chaque portail (`web-host`, `web-circuits`, `web-admin`)

---

## 5. Flux de Validation et Cycle de Vie des Données

```text
[Inscription Prestataire]
          │
          ▼
   Statut "PENDING"
          │
          ├──► Rejeté par Admin ──► Statut "REJECTED" (Motif transmis)
          │
          └──► Homologué par Admin ──► Statut "APPROVED"
                                            │
                                            ▼
                               [Création d'Offres & Circuits]
                                            │
                                            ▼
                                   Offre en "PENDING"
                                            │
                                            ├──► Refusée avec motif
                                            └──► Validée par Admin ──► Visible sur web-tourist
```

---

## 6. Répertoire des Composants & Architecture Fichiers

```text
frontend/
├── App.tsx                     # Application racine, gestionnaire d'état global, Portail Switcher
├── web-tourist/               # Portail Touriste & Découverte
├── web-host/
│   └── HostApp.tsx            # Portail Hébergeurs & Gestion hôtelière
├── web-circuits/
│   └── CircuitsApp.tsx        # Portail Agences & Guides (dossiers circuits, départs)
├── web-admin/
│   ├── AdminApp.tsx           # Portail Administrateur National
│   └── AdminCommunityManager.tsx # Modération du forum communautaire
└── components/
    └── CommunityModule.tsx    # Forum d'échange transversal

backend/
├── server.ts                  # Serveur Express, endpoints d'authentification unifiée et données
└── data.ts                    # Données de référence et référentiels initiaux

shared/
├── types/index.ts             # Typages TypeScript partagés (User, PortalType, Establishment, Offer...)
└── ui/                        # Composants UI réutilisables (TerangaLogo, MapMock, MessagingWidget...)
```
