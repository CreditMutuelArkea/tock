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
| `applicationId` | string | Non | Filtrer par application |
| `status` | string | Non | Filtrer par statut (`CREATED`, `IN_PROGRESS`, `VALIDATED`, `CANCELLED`) |

### Response 200

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "applicationId": "my-bot",
    "name": "Évaluation Q1 2026",
    "description": "Vérification qualité avant mise en prod",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-01-14T23:59:59Z",
    "requestedDialogCount": 50,
    "status": "IN_PROGRESS",
    "createdBy": "user@example.com",
    "creationDate": "2026-01-14T10:30:00Z",
    "totalBotResponses": 125
  }
]
```

---

## 2. Créer un échantillon

**POST** `/bot/evaluation-samples`

### Request Body

```json
{
  "applicationId": "my-bot",
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-01-14T23:59:59Z",
  "requestedDialogCount": 50,
  "includeTestDialogs": false
}
```

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "applicationId": "my-bot",
  "status": "CREATED",
  "totalBotResponses": 125,
  "createdBy": "user@example.com",
  "creationDate": "2026-01-14T10:30:00Z"
}
```

---

## 3. Récupérer un échantillon

**GET** `/bot/evaluation-samples/:sampleId`

Retourne l'échantillon avec toutes les réponses et leurs évaluations.

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "applicationId": "my-bot",
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-01-14T23:59:59Z",
  "requestedDialogCount": 50,
  "includeTestDialogs": false,
  "status": "IN_PROGRESS",
  "createdBy": "user@example.com",
  "creationDate": "2026-01-14T10:30:00Z",
  "totalBotResponses": 125,
  "botResponses": [
    {
      "id": "resp_001",
      "dialogId": "dialog_abc123",
      "actionId": "action_002",
      "userMessage": "Comment réserver un train ?",
      "botMessage": "Je peux vous aider à réserver un train. Quelle est votre destination ?",
      "date": "2026-01-10T14:30:01Z",
      "evaluation": {
        "status": "OK",
        "evaluatedBy": "evaluator@example.com",
        "creationDate": "2026-01-14T11:00:00Z"
      }
    },
    {
      "id": "resp_002",
      "dialogId": "dialog_def456",
      "actionId": "action_011",
      "userMessage": "Quel temps fait-il ?",
      "botMessage": "Je ne peux pas répondre à cette question.",
      "date": "2026-01-11T09:00:01Z",
      "evaluation": null
    }
  ]
}
```

---

## 4. Démarrer l'évaluation

**POST** `/bot/evaluation-samples/:sampleId/start`

Passe l'échantillon de `CREATED` à `IN_PROGRESS`.

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "IN_PROGRESS"
}
```

### Response 400

```json
{
  "error": "Sample cannot be started (status: VALIDATED)"
}
```

---

## 5. Évaluer une réponse

**POST** `/bot/evaluation-samples/:sampleId/evaluate`

### Request Body - OK

```json
{
  "responseId": "resp_001",
  "status": "OK",
  "comment": "Réponse claire et pertinente"
}
```

### Request Body - KO

```json
{
  "responseId": "resp_002",
  "status": "KO",
  "reason": "QUESTION_MISUNDERSTOOD",
  "comment": "Le bot aurait dû rediriger vers un service météo"
}
```

### Response 200

```json
{
  "id": "eval_xyz789",
  "sampleId": "507f1f77bcf86cd799439011",
  "responseId": "resp_002",
  "status": "KO",
  "reason": "QUESTION_MISUNDERSTOOD",
  "evaluatedBy": "evaluator@example.com",
  "creationDate": "2026-01-14T11:10:00Z"
}
```

### Raisons possibles (optionnelles)

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

## 6. Récupérer les statistiques

**GET** `/bot/evaluation-samples/:sampleId/statistics`

### Response 200

```json
{
  "totalBotResponses": 125,
  "totalDialogs": 50,
  "okCount": 100,
  "koCount": 20,
  "evaluatedCount": 120,
  "remainingCount": 5,
  "okPercentage": 83.33,
  "koPercentage": 16.67,
  "koByReason": {
    "QUESTION_MISUNDERSTOOD": 8,
    "HALLUCINATION": 5,
    "INCOMPLETE_ANSWER": 4,
    "OTHER": 3
  }
}
```

---

## 7. Valider l'évaluation

**POST** `/bot/evaluation-samples/:sampleId/validate`

Toutes les réponses doivent être évaluées.

### Response 200

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "VALIDATED",
  "validatedDate": "2026-01-14T12:00:00Z",
  "validatedBy": "validator@example.com"
}
```

### Response 400

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
| `GET` | `/bot/evaluation-samples/:id` | Récupérer un échantillon (avec réponses et évaluations) |
| `POST` | `/bot/evaluation-samples/:id/start` | Démarrer l'évaluation |
| `POST` | `/bot/evaluation-samples/:id/evaluate` | Évaluer une réponse |
| `GET` | `/bot/evaluation-samples/:id/statistics` | Statistiques |
| `POST` | `/bot/evaluation-samples/:id/validate` | Valider l'évaluation |

