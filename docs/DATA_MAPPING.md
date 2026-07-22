# Mapping des Données et Modèles Métier - Teranga Travel

## Roles Utilisateurs

| Rôle | Description | Application principale |
| --- | --- | --- |
| `tourist` | Voyageur, touriste national ou international | `web-tourist` |
| `professional` | Hébergeur (Hôtel, Campement, Maison d'hôtes), Agence ou Guide | `web-host`, `web-circuits` |
| `admin` | Administrateur et modérateur de la plateforme | `web-admin` |

---

## Types d'Établissements & Prestataires

- `hotel` : Hôtel de tourisme (1 à 5 étoiles)
- `campement` : Campement éco-responsable ou lodge villageois
- `maison_hotes` : Auberge, villa ou maison d'hôtes traditionnelle
- `agence` : Agence de voyage ou agence réceptive
- `guide` : Guide touristique agréé indépendant ou sous agence

---

## Cycle de Vie de Validation des Offres

```text
[Draft] ──► [Pending] ──► (Modération Admin) ──► [Approved] (Visible aux touristes)
                              │
                              └──► [Rejected] (Notification motif + correction possible)
```

1. **Création** : L'hébergeur ou l'agence soumet une offre (`status = pending`).
2. **Examen Admin** : L'administrateur consulte l'offre dans `web-admin` (menu Validation Offres).
3. **Approbation / Refus** :
   - Si validée : `status = approved`, l'offre est publiée instantanément sur `web-tourist`.
   - Si refusée : `status = rejected`, motif obligatoire enregistré (`rejectionReason`).
