# Spécification API REST

## Base URL

```
/bots/:botId/evaluation-sets
```

> **Note sur l'identité du bot :**
> - Le `botId` correspond à l'`applicationName` dans Tock
> - Le **namespace** est récupéré depuis le **contexte utilisateur** (session/token), pas dans l'URL
> - Un bot est **uniquement identifié** par le couple `namespace + applicationName`
> - Un même `applicationName` peut exister dans différents namespaces (multi-tenant)
> - Le backend résout l'identité complète en combinant le `botId` de l'URL avec le `namespace` du contexte

---

## 1. Liste des ensembles d'évaluation

**GET** `/bots/:botId/evaluation-sets`

Liste les ensembles des 365 derniers jours pour le bot spécifié.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `botId` | string | Identifiant du bot (applicationName) |

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Non | Filtrer par statut (`IN_PROGRESS`, `VALIDATED`, `CANCELLED`). Par défaut : `IN_PROGRESS`, `VALIDATED` |

### Response 200

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "botId": "my-bot",
    "name": "Évaluation Q1 2026",
    "description": "Vérification qualité avant mise en prod",
    "dialogActivityFrom": "2026-01-01T00:00:00Z",
    "dialogActivityTo": "2026-01-14T23:59:59Z",
    "requestedDialogCount": 50,
    "dialogsCount": 50,
    "totalDialogCount": 120,
    "botActionCount": 125,
    "allowTestDialogs": false,
    "status": "IN_PROGRESS",
    "createdBy": "user-id-123",
    "creationDate": "2026-01-14T10:30:00Z",
    "statusChangedBy": "user-id-123",
    "statusChangeDate": "2026-01-14T10:30:00Z",
    "statusComment": null,
    "evaluationsResult": {
      "total": 125,
      "evaluated": 80,
      "remaining": 45,
      "positiveCount": 60,
      "negativeCount": 20
    }
  }
]
```

> **Note:** `evaluationsResult` est calculé à la volée, non persisté.

---

## 2. Créer un ensemble d'évaluation

**POST** `/bots/:botId/evaluation-sets`

Le `createdBy` est récupéré depuis le contexte utilisateur.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `botId` | string | Identifiant du bot (applicationName) |

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Non | Nom de l'ensemble |
| `description` | string | Non | Description libre |
| `dialogActivityFrom` | instant | Oui | Début de la période d'activité |
| `dialogActivityTo` | instant | Oui | Fin de la période d'activité |
| `requestedDialogCount` | int | Oui | Nombre de dialogs demandés |
| `allowTestDialogs` | boolean | Non | Autoriser les dialogs de test (défaut: false) |

```json
{
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  "dialogActivityFrom": "2026-01-01T00:00:00Z",
  "dialogActivityTo": "2026-01-14T23:59:59Z",
  "requestedDialogCount": 50,
  "allowTestDialogs": false
}
```

### Response 201

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "botId": "my-bot",
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  "dialogActivityFrom": "2026-01-01T00:00:00Z",
  "dialogActivityTo": "2026-01-14T23:59:59Z",
  "requestedDialogCount": 50,
  "dialogsCount": 50,
  "totalDialogCount": 120,
  "botActionCount": 125,
  "allowTestDialogs": false,
  "status": "IN_PROGRESS",
  "createdBy": "user-id-123",
  "creationDate": "2026-01-14T10:30:00Z",
  "statusChangedBy": "user-id-123",
  "statusChangeDate": "2026-01-14T10:30:00Z",
  "statusComment": null,
  "evaluationsResult": {
    "total": 125,
    "evaluated": 0,
    "remaining": 125,
    "positiveCount": 0,
    "negativeCount": 0
  }
}
```

> **Note:** 
> - Les évaluations sont créées en parallèle avec `status = UNSET`
> - `statusChangedBy` et `statusChangeDate` sont initialisés avec les valeurs de création

---

## 3. Récupérer un ensemble d'évaluation

**GET** `/bots/:botId/evaluation-sets/:setId`

Retourne l'ensemble avec ses métadonnées et statistiques.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `botId` | string | Identifiant du bot (applicationName) |
| `setId` | string | Identifiant de l'ensemble |

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "botId": "my-bot",
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  "dialogActivityFrom": "2026-01-01T00:00:00Z",
  "dialogActivityTo": "2026-01-14T23:59:59Z",
  "requestedDialogCount": 50,
  "dialogsCount": 50,
  "totalDialogCount": 120,
  "botActionCount": 125,
  "allowTestDialogs": false,
  "status": "IN_PROGRESS",
  "createdBy": "user-id-123",
  "creationDate": "2026-01-14T10:30:00Z",
  "statusChangedBy": "user-id-123",
  "statusChangeDate": "2026-01-14T10:30:00Z",
  "statusComment": null,
  "evaluationsResult": {
    "total": 125,
    "evaluated": 80,
    "remaining": 45,
    "positiveCount": 60,
    "negativeCount": 20
  }
}
```

---

## 4. Récupérer les bot-refs (paginé)

**GET** `/bots/:botId/evaluation-sets/:setId/bot-refs`

Récupère les références aux actions à évaluer avec pagination, et optionnellement les évaluations et dialogs associés.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `botId` | string | Identifiant du bot (applicationName) |
| `setId` | string | Identifiant de l'ensemble |

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `start` | int | Non | Index de début (défaut: 0) |
| `size` | int | Non | Nombre d'éléments (défaut: 20) |
| `includeDialogs` | boolean | Non | Inclure les dialogs associés (défaut: false) |
| `includeEvaluations` | boolean | Non | Inclure les évaluations associées (défaut: true) |
| `status` | string | Non | Filtrer par statut d'évaluation (`UNSET`, `UP`, `DOWN`) |

### Response 200

```json
{
  "start": 0,
  "end": 20,
  "total": 125,
  "botRefs": [
    {
      "dialogId": "dialog_abc123",
      "actionId": "action_002",
      "evaluation": {
        "_id": "eval_001",
        "status": "UP",
        "reason": null,
        "evaluator": {
          "id": "user-id-456"
        },
        "evaluationDate": "2026-01-14T11:00:00Z"
      }
    },
    {
      "dialogId": "dialog_def456",
      "actionId": "action_011",
      "evaluation": {
        "_id": "eval_002",
        "status": "UNSET",
        "reason": null,
        "evaluator": null,
        "evaluationDate": null
      }
    },
    {
      "dialogId": "dialog_ghi789",
      "actionId": "action_005",
      "evaluation": {
        "_id": "eval_003",
        "status": "DOWN",
        "reason": "HALLUCINATION",
        "evaluator": {
          "id": "user-id-789"
        },
        "evaluationDate": "2026-01-14T11:05:00Z"
      }
    },
    {
      "dialogId": "dialog_purged999",
      "actionId": "action_007",
      "evaluation": {
        "_id": "eval_004",
        "status": "UP",
        "reason": null,
        "evaluator": {
          "id": "user-id-456"
        },
        "evaluationDate": "2026-01-14T11:02:00Z"
      }
    }
  ],
  "dialogs": {
    "found": [
      {
        "_id": "dialog_abc123",
        "actions": [...]
      },
      {
        "_id": "dialog_def456",
        "actions": [...]
      },
      {
        "_id": "dialog_ghi789",
        "actions": [...]
      }
    ],
    "missing": [
      {
        "dialogId": "dialog_purged999",
        "actionId": "action_007"
      }
    ]
  }
}
```

> **Note:** `dialogs.missing` contient les références dont le dialog a été purgé. L'évaluation reste disponible mais sans contexte.

---

## 5. Évaluer une réponse

**PATCH** `/bots/:botId/evaluation-sets/:setId/evaluations/:evaluationId`

Met à jour l'évaluation d'une action. L'évaluateur est **détecté automatiquement** depuis le contexte utilisateur (comme pour les autres opérations de création/modification).

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `botId` | string | Identifiant du bot (applicationName) |
| `setId` | string | Identifiant de l'ensemble |
| `evaluationId` | string | Identifiant de l'évaluation |

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Oui | `UP` ou `DOWN` |
| `reason` | string | Non | Raison du DOWN (null si UP) |

> **Note:** L'`evaluator` est renseigné automatiquement côté serveur à partir du contexte utilisateur avant l'entrée dans le service.

#### Exemple : Évaluation positive (UP)

```json
{
  "status": "UP"
}
```

#### Exemple : Évaluation négative (DOWN)

```json
{
  "status": "DOWN",
  "reason": "QUESTION_MISUNDERSTOOD"
}
```

#### Exemple : Évaluation négative sans raison

```json
{
  "status": "DOWN"
}
```

### Response 200

```json
{
  "_id": "eval_002",
  "evaluationSetId": "507f1f77bcf86cd799439011",
  "dialogId": "dialog_def456",
  "actionId": "action_011",
  "status": "DOWN",
  "reason": "QUESTION_MISUNDERSTOOD",
  "evaluator": {
    "id": "user-id-456"
  },
  "evaluationDate": "2026-01-14T11:10:00Z"
}
```

### Response 409 (Conflict)

En cas de conflit d'écriture concurrent.

```json
{
  "error": "Conflict: evaluation was modified by another user"
}
```

### Raisons possibles (pour DOWN)

| Valeur | Description |
|--------|-------------|
| `INACCURATE_ANSWER` | Réponse inexacte |
| `INCOMPLETE_ANSWER` | Réponse incomplète |
| `HALLUCINATION` | Hallucination |
| `INCOMPLETE_SOURCES` | Sources incomplètes |
| `OBSOLETE_SOURCES` | Sources obsolètes |
| `WRONG_ANSWER_FORMAT` | Mauvais format de réponse |
| `BUSINESS_LEXICON_PROBLEM` | Problème de lexique métier |
| `QUESTION_MISUNDERSTOOD` | Question mal comprise |
| `OTHER` | Autre |

---

## 6. Changer le statut d'un ensemble

**POST** `/bots/:botId/evaluation-sets/:setId/change-status`

API unique pour valider ou annuler un ensemble. Le `statusChangedBy` est récupéré depuis le contexte utilisateur.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `botId` | string | Identifiant du bot (applicationName) |
| `setId` | string | Identifiant de l'ensemble |

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `targetStatus` | string | Oui | `VALIDATED` ou `CANCELLED` |
| `comment` | string | Non | Commentaire associé au changement |

#### Exemple : Validation

```json
{
  "targetStatus": "VALIDATED",
  "comment": "Évaluation complète, bot validé pour mise en prod"
}
```

#### Exemple : Annulation

```json
{
  "targetStatus": "CANCELLED",
  "comment": "Période d'évaluation incorrecte"
}
```

### Response 200 (Validation réussie)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "VALIDATED",
  "statusChangedBy": "user-id-789",
  "statusChangeDate": "2026-01-14T12:00:00Z",
  "statusComment": "Évaluation complète, bot validé pour mise en prod"
}
```

### Response 200 (Annulation réussie)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "CANCELLED",
  "statusChangedBy": "user-id-789",
  "statusChangeDate": "2026-01-14T12:00:00Z",
  "statusComment": "Période d'évaluation incorrecte"
}
```

### Response 422 (Validation impossible)

```json
{
  "error": "All bot responses must be evaluated before validation",
  "details": {
    "remaining": 5,
    "total": 125
  }
}
```

### Response 422 (Annulation impossible)

```json
{
  "error": "Set cannot be cancelled",
  "details": {
    "currentStatus": "VALIDATED",
    "allowedTransitions": []
  }
}
```

### Transitions de statut autorisées

| Statut actuel | Transitions autorisées |
|---------------|------------------------|
| `IN_PROGRESS` | `VALIDATED`, `CANCELLED` |
| `VALIDATED` | aucune |
| `CANCELLED` | aucune |

---

## Résumé des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/bots/:botId/evaluation-sets` | Liste des ensembles |
| `POST` | `/bots/:botId/evaluation-sets` | Créer un ensemble |
| `GET` | `/bots/:botId/evaluation-sets/:setId` | Récupérer un ensemble |
| `GET` | `/bots/:botId/evaluation-sets/:setId/bot-refs` | Liste des bot-refs paginée |
| `PATCH` | `/bots/:botId/evaluation-sets/:setId/evaluations/:evalId` | Évaluer une réponse |
| `POST` | `/bots/:botId/evaluation-sets/:setId/change-status` | Changer le statut |

---

## Types et Enums

### EvaluationStatus

```typescript
enum EvaluationStatus {
  UNSET = "UNSET",  // Non évalué (valeur initiale)
  UP = "UP",        // Évaluation positive
  DOWN = "DOWN"     // Évaluation négative
}
```

### EvaluationSetStatus

```typescript
enum EvaluationSetStatus {
  IN_PROGRESS = "IN_PROGRESS",
  VALIDATED = "VALIDATED",
  CANCELLED = "CANCELLED"
}
```

### Evaluator

```typescript
interface Evaluator {
  id: string;
}
```
