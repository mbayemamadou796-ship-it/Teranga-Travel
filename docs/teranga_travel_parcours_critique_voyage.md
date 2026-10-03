# Teranga Travel — Parcours critique de bout en bout

## 1. Objectif du document

Ce document définit le **premier parcours critique de référence** de Teranga Travel.

L'objectif est de concevoir et valider un cycle complet :

> **Un voyageur découvre un hébergement et un guide, envoie une demande de réservation, reçoit les confirmations nécessaires, effectue son séjour, puis dépose un avis vérifié.**

Ce parcours sert de **fil rouge de conception** pour :

- le portail public ;
- le portail Touriste ;
- le portail Hébergeur ;
- le portail Circuits & Guides ;
- le portail Administrateur ;
- le backend et la base de données ;
- les notifications ;
- les disponibilités ;
- les réservations ;
- les avis vérifiés.

---

## 2. Parcours cible

```text
VISITEUR
   │
   ▼
Vitrine publique
   │
   ├── Recherche destination
   ├── Consultation hébergement
   └── Consultation guide / circuit
   │
   ▼
Création de compte / Connexion
   │
   ▼
VOYAGEUR
   │
   ├── Sélectionne un hébergement
   ├── Sélectionne un guide
   ├── Choisit les dates
   └── Envoie une demande
   │
   ▼
Vérification des disponibilités
   │
   ├── Hébergeur
   └── Guide
   │
   ▼
Demandes en attente
   │
   ├── Hébergeur confirme
   └── Guide confirme
   │
   ▼
Réservation confirmée
   │
   ▼
Avant le séjour
   │
   ├── Dossier voyageur
   ├── Informations pratiques
   └── Notifications
   │
   ▼
SÉJOUR
   │
   ├── Arrivée / check-in
   ├── Séjour
   └── Départ / fin de prestation
   │
   ▼
Séjour terminé
   │
   ▼
Invitation à laisser un avis
   │
   ▼
Avis vérifié
   │
   ▼
Publication de l'avis
```

---

## 3. Acteurs du parcours

### 3.1 Voyageur
- Consulte les offres
- Sélectionne un hébergement et un guide
- Renseigne son séjour
- Envoie une demande combinée
- Suit son dossier de voyage
- Reçoit les confirmations
- Effectue son séjour
- Laisse un avis vérifié

### 3.2 Hébergeur
- Publie un hébergement validé
- Configure ses disponibilités
- Reçoit les demandes d'hébergement
- Accepte ou refuse une demande
- Prépare le séjour et valide l'arrivée / départ

### 3.3 Guide / Organisateur
- Publie son offre de guidage agréée
- Reçoit les demandes de guidage
- Accepte ou refuse la demande
- Réalise la prestation et confirme l'achèvement

### 3.4 Administrateur
- Valide les professionnels et offres
- Supervise les dossiers de voyages (`TravelBooking`)
- Gère les litiges et anomalies
- Contrôle et modère les avis vérifiés

### 3.5 Système
- Vérifie les disponibilités côté backend
- Crée le dossier `TravelBooking` avec `BookingItem` pour chaque prestataire
- Synchronise les statuts (`PENDING` -> `PARTIALLY_CONFIRMED` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED`)
- Envoie les notifications d'état
- Débloque le droit au dépôt d'avis vérifié

---

## 4. Concept central : Réservation combinée & Dossier de voyage

```text
Dossier de voyage (TravelBooking) : TT-2026-XXXXX
│
├── Voyageur (Nom, Email, Téléphone)
├── Séjour (Destination, Dates, Nb voyageurs)
│
├── Prestation hébergement (BookingItem)
│   ├── Établissement & Offre
│   ├── Nuits, Prix
│   └── Statut (PENDING / CONFIRMED / REJECTED / IN_PROGRESS / COMPLETED)
│
└── Prestation guide (BookingItem)
    ├── Guide accrédité & Spécialités
    ├── Jours de guidage, Prix
    └── Statut (PENDING / CONFIRMED / REJECTED / IN_PROGRESS / COMPLETED)
```

Chaque professionnel ne consulte et n'administre que la prestation qui le concerne directement.
L'administrateur supervise la globalité du dossier.
L'avis vérifié est strictement conditionné à une prestation terminée (`COMPLETED`).
