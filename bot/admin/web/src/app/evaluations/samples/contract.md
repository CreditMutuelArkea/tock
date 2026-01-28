# Endpoints pour la gestion des échantillons d'évaluation

## 1. Lister les samples existants

**Path:** `GET /bots/{applicationName}/evaluation-samples`

**Example Response:**

```json
[
  {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Evaluation janvier 2027",
    "description": "Evaluation de conformité",
    "dialogActivityFrom": "2026-01-01T00:00:00Z",
    "dialogActivityTo": "2026-01-31T23:59:59Z",
    "allowTestDialogs": true,
    "creationDate": "2026-02-20T10:00:00Z",
    "createdBy": "LS661",
    "validationDate": null,
    "validatedBy": null,
    "requestedDialogCount": 100,
    "dialogsCount": 85,
    "totalDialogCount": 85,
    "botActionCount": 95,
    "status": "in_progress",
    "evaluationsResult": {
      "positiveCount": 42,
      "negativeCount": 12
    }
  }
]
```

**Status Enum**

```TypeScript
enum EvaluationSampleStatus {
  IN_PROGRESS = 'in_progress',
  VALIDATED = 'validated'
}
```

---

## 2. Créer un sample

**Path:** `POST /bots/{applicationName}/evaluation-samples`
**Payload Example:**

```json
{
  "name": "Evaluation avril 2027",
  "description": "Evaluation de conformité",
  "dialogActivityFrom": "2026-02-01T00:00:00Z",
  "dialogActivityTo": "2026-02-28T23:59:59Z",
  "allowTestDialogs": false,
  "requestedDialogCount": 200
}
```

**Response Example:**

```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
  "name": "Evaluation avril 2027",
  "description": "Evaluation de conformité",
  "dialogActivityFrom": "2026-02-01T00:00:00Z",
  "dialogActivityTo": "2026-02-28T23:59:59Z",
  "allowTestDialogs": false,
  "creationDate": "2026-01-27T12:00:00Z",
  "createdBy": "LS661",
  "validationDate": null,
  "validatedBy": null,
  "requestedDialogCount": 200,
  "dialogsCount": 200,
  "totalDialogCount": 1298,
  "botActionCount": 243,
  "status": "in_progress",
  "evaluationsResult": {
    "positiveCount": 0,
    "negativeCount": 0
  }
}
```

---

## 3. Supprimer un sample

**Path:** `DELETE /bots/{applicationName}/evaluation-samples/{sampleId}`
**Response:** `204 No Content` (no body)

---

## 4. Obtenir le détail d'un sample donné

**Path:** `GET /bots/{applicationName}/evaluation-samples/{sampleId}`
**Response Example:**

```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Evaluation janvier 2027",
  "description": "Evaluation de conformité",
  "dialogActivityFrom": "2026-01-01T00:00:00Z",
  "dialogActivityTo": "2026-01-31T23:59:59Z",
  "allowTestDialogs": true,
  "creationDate": "2026-02-20T10:00:00Z",
  "createdBy": "LS661",
  "validationDate": null,
  "validatedBy": null,
  "requestedDialogCount": 100,
  "dialogsCount": 85,
  "totalDialogCount": 85,
  "botActionCount": 95,
  "status": "in_progress",
  "evaluationsResult": {
    "positiveCount": 42,
    "negativeCount": 12
  }
}
```

---

## 5. Obtenir les data d'un sample (avec pagination)

**Path:** `POST /bots/{applicationName}/evaluation-samples/{sampleId}/data`
**Payload Example:**

- `start`: `number` (index de début, default: 0)
- `size`: `number` (taille de la page, default: 20)

**Response Example:**

```json
{
  "start": 0,
  "end": 20,
  "total": 95,
  "dialogs": [
    {
      "id": "dialogId-1",
      "actions": [...],
      ...
    },
    ...
  ],
  "evaluations": [
    {
      "_id": "eval1",
      "dialogId": "dialogId-1",
      "actionId": "actionId-2",
      "evaluationSampleId": "65a1b2c3d4e5f6a7b8c9d0e1",
      "status": "up",
      "reason": null,
      "evaluatedBy": "LS661",
      "evaluationDate": "2026-01-25T09:00:00Z"
    },
    {
      "_id": "eval2",
      "dialogId": "dialogId-1",
      "actionId": "actionId-4",
      "evaluationSampleId": "65a1b2c3d4e5f6a7b8c9d0e1",
      "status": "down",
      "reason": "INACCURATE_ANSWER",
      "evaluatedBy": "LS661",
      "evaluationDate": "2026-01-25T09:01:00Z"
    },
    {
      "_id": "eval2",
      "dialogId": "dialogId-1",
      "actionId": "actionId-6",
      "evaluationSampleId": "65a1b2c3d4e5f6a7b8c9d0e1",
      "status": "unset",
      "reason": null,
      "evaluatedBy": null,
      "evaluationDate": null
    },
    ...
  ]
}
```

---

## 6. Mettre à jour une evaluation (status et reason)

**Path:** `POST /bots/{applicationName}/evaluation-samples/{sampleId}/evaluations/{evaluationId}`
**Payload Examples:**

```json
{
  "status": "up"
}
```

```json
{
  "status": "down",
  "reason": "INACCURATE_ANSWER"
}
```

**Status Enum**

```TypeScript
enum EvaluationStatus {
  UNSET = 'unset',
  UP = 'up',
  DOWN = 'down'
}
```

**Reason enum (partagé avec Annotations)**

```TypeScript
ResponseIssueReason {
  INACCURATE_ANSWER = 'INACCURATE_ANSWER',
  INCOMPLETE_ANSWER = 'INCOMPLETE_ANSWER',
  HALLUCINATION = 'HALLUCINATION',
  INCOMPLETE_SOURCES = 'INCOMPLETE_SOURCES',
  OBSOLETE_SOURCES = 'OBSOLETE_SOURCES',
  WRONG_ANSWER_FORMAT = 'WRONG_ANSWER_FORMAT',
  BUSINESS_LEXICON_PROBLEM = 'BUSINESS_LEXICON_PROBLEM',
  QUESTION_MISUNDERSTOOD = 'QUESTION_MISUNDERSTOOD',
  OTHER = 'OTHER'
}
```

**Response Example:**

```json
{
  "_id": "eval1",
  "dialogId": "dialog1",
  "actionId": "action1",
  "evaluationSampleId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "status": "down",
  "reason": "INCOMPLETE_SOURCES",
  "evaluatedBy": "LS661",
  "evaluationDate": "2026-01-27T12:30:00Z"
}
```

---

## 7. Mettre à jour le status d'un sample avec un commentaire optionnel

**Path:** `POST /bots/{applicationName}/evaluation-samples/{sampleId}/status`
**Payload Example:**

```json
{
  "status": "validated",
  "comment": "All evaluations reviewed and validated"
}
```

**Response Example:**

```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Sample X",
  "description": "Evaluation sample desc",
  "dialogActivityFrom": "2026-01-01T00:00:00Z",
  "dialogActivityTo": "2026-01-31T23:59:59Z",
  "allowTestDialogs": true,
  "creationDate": "2026-01-20T10:00:00Z",
  "createdBy": "LS661",
  "validationDate": "2026-01-27T13:00:00Z",
  "validatedBy": "LS661",
  "requestedDialogCount": 100,
  "dialogsCount": 85,
  "totalDialogCount": null,
  "botActionCount": 75,
  "status": "validated",
  "evaluationsResult": {
    "positiveCount": 63,
    "negativeCount": 12
  },
  "comment": "All evaluations reviewed and validated"
}
```
