# Ensembles d'Évaluation de Dialogs

## Objectif

Permettre aux utilisateurs métier d'évaluer la qualité des réponses du bot via un processus d'échantillonnage et de notation (UP/DOWN).

## Points clés

| Aspect | Description |
|--------|-------------|
| **Granularité** | Évaluation par **réponse du bot** (pas par dialog) |
| **Collaboration** | **Plusieurs évaluateurs** simultanés |
| **Raison DOWN** | **Optionnelle** (même liste que les annotations) |
| **Données** | Utilisation des dialogs existants (pas de snapshot) |
| **Évaluateur** | Détecté automatiquement depuis le contexte utilisateur |
| **Initialisation** | Évaluations créées avec `status = UNSET` |
| **URL Pattern** | `/bots/:botId/evaluation-sets/...` (namespace via contexte) |

## Cycle de vie

```
IN_PROGRESS → VALIDATED   (via change-status)
IN_PROGRESS → CANCELLED   (via change-status)
```

## Statuts d'évaluation

| Statut | Description |
|--------|-------------|
| `UNSET` | Non évalué (valeur initiale) |
| `UP` | Évaluation positive |
| `DOWN` | Évaluation négative |

## Documentation

| Document | Description |
|----------|-------------|
| [DOMAIN.md](./DOMAIN.md) | Concepts métier, entités, enums, règles |
| [FUNCTIONAL.md](./FUNCTIONAL.md) | Flux fonctionnels, diagrammes de séquence, appels API |
| [TECHNICAL.md](./TECHNICAL.md) | Collections MongoDB, index, requêtes |
| [API.md](./API.md) | Spécification des endpoints REST |
| [DOMAIN_EVALUATION_REFLEXION.md](./DOMAIN_EVALUATION_REFLEXION.md) | ⚠️ TOO EARLY - Réflexions futures |

## Questions tranchées

| # | Question | Réponse |
|---|----------|---------|
| Q1 | Sélection des dialogs | Aléatoire |
| Q2 | Pas assez de réponses | Prendre tout |
| Q4 | Stocker le `userMessage` en plus du `botMessage` ? | Non, utilisation des dialogs existants |
| Q5 | Format d'export | PDF |
| Q6 | Valeurs d'évaluation | UP, DOWN, UNSET |
| Q7 | Initialisation des évaluations | Créées à la création de l'ensemble avec UNSET |
| Q8 | API validation/annulation | `change-status` unique |

→ Détails dans [FUNCTIONAL.md](./FUNCTIONAL.md#3-questions-tranchées)
