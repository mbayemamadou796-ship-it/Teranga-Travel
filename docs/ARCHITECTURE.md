# Architecture officielle du projet Teranga Travel

## Objectif

Afin de faciliter le développement, la maintenance et les futures évolutions du projet, **Teranga Travel** adoptera une architecture **modulaire, évolutive et orientée métier**.

Le projet est composé de plusieurs applications web indépendantes qui communiquent toutes avec un **Backend unique**.

Chaque application possède son propre rôle, sa propre interface et son propre cycle de développement, tout en partageant les mêmes données via une API centralisée.

---

# Architecture générale

```text
teranga-travel/

│
├── frontend/
│   │
│   ├── web-tourist/           # Application des voyageurs
│   ├── web-host/              # Hôtels, campements, auberges, maisons d'hôtes
│   ├── web-circuits/          # Agences de voyage et guides touristiques
│   └── web-admin/             # Administration de la plateforme
│
├── backend/
│   │
│   ├── api/
│   ├── auth/
│   ├── database/
│   ├── modules/
│   ├── notifications/
│   ├── storage/
│   └── utils/
│
├── shared/
│   │
│   ├── ui/
│   ├── types/
│   ├── constants/
│   ├── validators/
│   └── utils/
│
├── docs/
│
├── infra/
│   │
│   ├── docker/
│   ├── nginx/
│   ├── github/
│   └── deployment/
│
├── scripts/
│
└── README.md
```

---

# 1. Frontend

Le dossier **frontend** contient toutes les applications web du projet.

Chaque application est indépendante afin de pouvoir évoluer sans impacter les autres.

Toutes les applications utilisent néanmoins :

- la même API ;
- la même base de données ;
- les mêmes modèles de données ;
- les mêmes composants partagés.

---

# Application Web Touriste (`web-tourist`)

Cette application constitue la vitrine principale de Teranga Travel.

Elle est destinée aux voyageurs souhaitant découvrir et réserver leur séjour au Sénégal.

```text
web-tourist/

src/

├── app/
│
├── modules/
│   ├── accueil/
│   ├── destinations/
│   ├── hebergements/
│   ├── circuits/
│   ├── guides/
│   ├── reservations/
│   ├── favoris/
│   ├── avis/
│   ├── profil/
│   └── parametres/
│
├── components/
├── services/
├── hooks/
├── types/
└── utils/
```

Chaque fonctionnalité est regroupée dans son propre module afin de faciliter son évolution.

---

# Application Web Hébergeurs (`web-host`)

Cette application est destinée aux professionnels de l'hébergement :

- hôtels ;
- campements ;
- auberges ;
- maisons d'hôtes.

Elle doit être conçue comme un véritable outil de gestion.

```text
web-host/

src/

├── app/
│
├── modules/
│   ├── dashboard/
│   ├── etablissements/
│   ├── offres/
│   ├── chambres/
│   ├── disponibilites/
│   ├── reservations/
│   ├── calendrier/
│   ├── statistiques/
│   ├── profil/
│   └── parametres/
│
├── components/
├── services/
├── hooks/
├── types/
└── utils/
```

Les hébergeurs pourront notamment :

- gérer leur établissement ;
- créer des offres ;
- gérer leurs chambres ;
- définir les disponibilités ;
- consulter leurs réservations.

---

# Application Web Circuits & Guides (`web-circuits`)

Cette application est destinée :

- aux agences de voyage ;
- aux agences d'accompagnement de séjour ;
- aux guides touristiques.

Elle leur permet de gérer leurs circuits et leurs prestations.

```text
web-circuits/

src/

├── app/
│
├── modules/
│   ├── dashboard/
│   ├── circuits/
│   ├── guides/
│   ├── itineraires/
│   ├── reservations/
│   ├── calendrier/
│   ├── statistiques/
│   ├── profil/
│   └── parametres/
│
├── components/
├── services/
├── hooks/
├── types/
└── utils/
```

Les agences pourront :

- créer des circuits ;
- gérer leurs offres ;
- publier des photos ;
- consulter leurs réservations.

Les guides pourront :

- gérer leur profil ;
- définir leurs disponibilités ;
- recevoir des réservations.

---

# Application Web Administrateur (`web-admin`)

L'administration est une application totalement indépendante.

Elle est le centre de contrôle de Teranga Travel.

Toutes les offres publiées par les hébergeurs, agences et guides passent par cette application avant d'être visibles par les touristes.

```text
web-admin/

src/

├── app/
│
├── modules/
│   ├── dashboard/
│   ├── utilisateurs/
│   ├── hebergeurs/
│   ├── etablissements/
│   ├── agences/
│   ├── guides/
│   ├── offres/
│   ├── reservations/
│   ├── destinations/
│   ├── statistiques/
│   ├── notifications/
│   └── parametres/
│
├── components/
├── services/
├── hooks/
├── types/
└── utils/
```

L'administrateur pourra :

- approuver ou refuser les offres ;
- gérer les utilisateurs ;
- gérer les établissements ;
- gérer les agences ;
- gérer les guides ;
- superviser les réservations ;
- consulter les statistiques de la plateforme.

---

# Communication entre les applications

Les quatre applications ne communiquent jamais directement entre elles.

Toutes les communications passent par le Backend.

```text
Web Hébergeurs ──► Backend ──► Base de Données
Web Circuits   ──► Backend ──► Base de Données
Web Admin      ──► Backend ──► Base de Données
Web Touriste   ──► Backend ──► Base de Données
```

Exemple :

1. Un hébergeur publie une nouvelle offre.
2. L'offre est enregistrée dans la base de données avec le statut **Pending**.
3. L'administrateur reçoit automatiquement la demande dans Web Admin.
4. Après validation, le statut devient **Approved**.
5. L'offre apparaît automatiquement dans l'application Touriste (`web-tourist`).
