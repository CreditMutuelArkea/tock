# Spécification API REST

## Base URL

```
/bot/evaluation-samples
```

---

## 1. Liste des échantillons

**GET** `/bot/evaluation-samples`

Liste les échantillons des 365 derniers jours.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `applicationName` | string | Non | Filtrer par application |
| `namespace` | string | Non | Filtrer par namespace |
| `status` | string | Non | Filtrer par statut (`IN_PROGRESS`, `VALIDATED`, `CANCELLED`). Par défaut : `IN_PROGRESS`, `VALIDATED` |

### Response 200

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "applicationName": "my-bot",
    "namespace": "my-namespace",
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
    "validatedBy": null,
    "validationDate": null,
    "cancelledBy": null,
    "cancelDate": null,
    "evaluationsResult": {
      "positiveCount": 80,
      "negativeCount": 20
    }
  }
]
```

> **Note:** `evaluationsResult` est calculé à la volée, non persisté.

---

## 2. Créer un échantillon

**POST** `/bot/evaluation-samples`

Le `createdBy` est récupéré depuis le contexte utilisateur.

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `applicationName` | string | Oui | Nom de l'application |
| `namespace` | string | Oui | Namespace |
| `name` | string | Non | Nom de l'échantillon |
| `description` | string | Non | Description libre |
| `dialogActivityFrom` | instant | Oui | Début de la période d'activité |
| `dialogActivityTo` | instant | Oui | Fin de la période d'activité |
| `requestedDialogCount` | int | Oui | Nombre de dialogs demandés |
| `allowTestDialogs` | boolean | Non | Autoriser les dialogs de test (défaut: false) |

```json
{
  "applicationName": "my-bot",
  "namespace": "my-namespace",
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
  "applicationName": "my-bot",
  "namespace": "my-namespace",
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
  "validatedBy": null,
  "validationDate": null,
  "cancelledBy": null,
  "cancelDate": null,
  "evaluationsResult": {
    "positiveCount": 0,
    "negativeCount": 0
  }
}
```

---

## 3. Récupérer un échantillon

**GET** `/bot/evaluation-samples/:sampleId`

Retourne l'échantillon avec ses métadonnées.

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "applicationName": "my-bot",
  "namespace": "my-namespace",
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
  "validatedBy": null,
  "validationDate": null,
  "cancelledBy": null,
  "cancelDate": null,
  "evaluationsResult": {
    "positiveCount": 80,
    "negativeCount": 20
  }
}
```

---

## 4. Récupérer les évaluations (paginé)

Récupère les évaluations avec pagination et optionnellement les dialogs associés.

### Option A : GET (RESTful) ✅

**GET** `/bot/evaluation-samples/:sampleId/evaluations`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `start` | int | Non | Index de début (défaut: 0) |
| `size` | int | Non | Nombre d'éléments (défaut: 20) |
| `includeDialogs` | boolean | Non | Inclure les dialogs associés (défaut: false) |

**Avantages :** Standard REST, cacheable, idempotent.

### Option B : POST (Search)

**POST** `/bot/evaluation-samples/:sampleId/evaluations/search`

```json
{
  "start": 0,
  "size": 20,
  "includeDialogs": true
}
```

**Avantages :** Extensible pour des filtres complexes futurs.

---

> **À trancher :** Quelle option retenir ?

### Response 200

```json
{
  "start": 0,
  "end": 20,
  "total": 125,
  "evaluations": [
    {
      "_id": "eval_001",
      "evaluationSampleId": "507f1f77bcf86cd799439011",
      "dialogId": "dialog_abc123",
      "actionId": "action_002",
      "evaluation": "OK",
      "reason": null,
      "evaluatedBy": "user-id-456",
      "evaluationDate": "2026-01-14T11:00:00Z"
    },
    {
      "_id": "eval_002",
      "evaluationSampleId": "507f1f77bcf86cd799439011",
      "dialogId": "dialog_def456",
      "actionId": "action_011",
      "evaluation": null,
      "reason": null,
      "evaluatedBy": null,
      "evaluationDate": null
    }
  ],
  "dialogs": [
    {
      "_id": "dialog_abc123",
      "actions": [...]
    },
    {
      "_id": "dialog_def456",
      "actions": [...]
    }
  ]
}
```

---

## 5. Évaluer une réponse

**PATCH** `/bot/evaluation-samples/:sampleId/evaluations/:evaluationId`

Met à jour l'évaluation d'une action. Le `evaluatedBy` est récupéré depuis le contexte utilisateur.

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `evaluation` | string | Oui | `OK` ou `KO` |
| `reason` | string | Non | Raison du KO (null si OK) |

```json
{
  "evaluation": "KO",
  "reason": "QUESTION_MISUNDERSTOOD"
}
```

### Response 200

```json
{
  "_id": "eval_002",
  "evaluationSampleId": "507f1f77bcf86cd799439011",
  "dialogId": "dialog_def456",
  "actionId": "action_011",
  "evaluation": "KO",
  "reason": "QUESTION_MISUNDERSTOOD",
  "evaluatedBy": "user-id-456",
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

### Raisons possibles

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

## 6. Annuler un échantillon

**POST** `/bot/evaluation-samples/:sampleId/cancel`

Annule un échantillon en cours. Le `cancelledBy` est récupéré depuis le contexte utilisateur.

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `cancelComment` | string | Non | Raison de l'annulation |

```json
{
  "cancelComment": "Période d'évaluation incorrecte"
}
```

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "CANCELLED",
  "cancelledBy": "user-id-789",
  "cancelDate": "2026-01-14T12:00:00Z",
  "cancelComment": "Période d'évaluation incorrecte"
}
```

### Response 422

```json
{
  "error": "Sample cannot be cancelled (status: VALIDATED)"
}
```

---

## 7. Valider l'évaluation

**POST** `/bot/evaluation-samples/:sampleId/validate`

Toutes les réponses doivent être évaluées. Le `validatedBy` est récupéré depuis le contexte utilisateur.

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `validationComment` | string | Non | Commentaire de validation |

```json
{
  "validationComment": "Évaluation complète, bot validé pour mise en prod"
}
```

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "VALIDATED",
  "validatedBy": "user-id-789",
  "validationDate": "2026-01-14T12:00:00Z",
  "validationComment": "Évaluation complète, bot validé pour mise en prod"
}
```

### Response 422

```json
{
  "error": "All bot responses must be evaluated before validation (5 remaining)"
}
```

---

## Résumé

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/bot/evaluation-samples` | Liste des échantillons |
| `POST` | `/bot/evaluation-samples` | Créer un échantillon |
| `GET` | `/bot/evaluation-samples/:id` | Récupérer un échantillon |
| `GET` ou `POST` | `/bot/evaluation-samples/:id/evaluations` ou `.../search` | Liste des évaluations (paginé) — *à trancher* |
| `PATCH` | `/bot/evaluation-samples/:id/evaluations/:evalId` | Évaluer une réponse |
| `POST` | `/bot/evaluation-samples/:id/cancel` | Annuler l'échantillon |
| `POST` | `/bot/evaluation-samples/:id/validate` | Valider l'évaluation |
