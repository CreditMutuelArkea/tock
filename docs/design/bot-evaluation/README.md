# Échantillonnage et Évaluation de Dialogs

## Objectif

Permettre aux utilisateurs métier d'évaluer la qualité des réponses du bot via un processus d'échantillonnage et de notation (OK/KO).

## Points clés

| Aspect | Description |
|--------|-------------|
| **Granularité** | Évaluation par **réponse du bot** (pas par dialog) |
| **Collaboration** | **Plusieurs évaluateurs** simultanés |
| **Raison KO** | **Optionnelle** (même liste que les annotations) |
| **Données** | **Snapshotées** à la création du sample |

## Cycle de vie

```
IN_PROGRESS → VALIDATED
IN_PROGRESS -> CANCELLED
```

## Documentation

| Document | Description |
|----------|-------------|
| [FUNCTIONAL.md](./FUNCTIONAL.md) | Concepts métier, règles, interface utilisateur |
| [TECHNICAL.md](./TECHNICAL.md) | Options de stockage, diagrammes de classes, flux |
| [API.md](./API.md) | Spécification des endpoints REST |

## Questions à trancher

| # | Question |
|---|----------|
| Q1 | Sélection des dialogs : Aléatoire 
| Q2 | Pas assez de réponses : Prendre tout |
| Q4 | Stocker le `userMessage` en plus du `botMessage` ? | Non, utilisation des dialogs existants

→ Détails dans [FUNCTIONAL.md](./FUNCTIONAL.md#questions-à-trancher)
