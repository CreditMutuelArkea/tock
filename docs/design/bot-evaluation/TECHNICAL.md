# Spécification technique

## 1. Diagramme de classes

### 1.1 Modèle de données

```mermaid
classDiagram
    class EvaluationSample {
        +ObjectId _id
        +String applicationName
        +String namespace
        +String name
        +String description
        +Instant dialogActivityFrom
        +Instant dialogActivityTo
        +int requestedDialogCount
        +int dialogsCount
        +int totalDialogCount
        +int botActionCount
        +boolean allowTestDialogs
        +List~BotActionRef~ botActionRefs
        +EvaluationSampleStatus status
        +String createdBy
        +Instant creationDate
        +String validatedBy
        +Instant validationDate
        +String validationComment
        +String cancelledBy
        +Instant cancelDate
        +Instant lastUpdateDate
    }

    class BotActionRef {
        +String dialogId
        +String actionId
    }

    class Evaluation {
        +ObjectId _id
        +ObjectId evaluationSampleId
        +String dialogId
        +String actionId
        +EvaluationStatus evaluation
        +EvaluationReason reason
        +String evaluatedBy
        +Instant evaluationDate
        +Instant creationDate
        +Instant lastUpdateDate
    }

    class EvaluationsResult {
        <<computed - non persisté>>
        +int total
        +int evaluated
        +int remaining
        +int positiveCount
        +int negativeCount
    }

    class EvaluationSampleStatus {
        <<enumeration>>
        IN_PROGRESS
        VALIDATED
        CANCELLED
    }

    class EvaluationStatus {
        <<enumeration>>
        OK
        KO
    }

    class EvaluationReason {
        <<enumeration>>
        INACCURATE_ANSWER
        INCOMPLETE_ANSWER
        HALLUCINATION
        INCOMPLETE_SOURCES
        OBSOLETE_SOURCES
        WRONG_ANSWER_FORMAT
        BUSINESS_LEXICON_PROBLEM
        QUESTION_MISUNDERSTOOD
        OTHER
    }

    EvaluationSample "1" *-- "many" BotActionRef : botActionRefs
    EvaluationSample "1" ..> "1" EvaluationsResult : computed
    EvaluationSample "1" -- "0..*" Evaluation : évaluations
    EvaluationSample --> EvaluationSampleStatus : status
    Evaluation --> EvaluationStatus : evaluation
    Evaluation --> EvaluationReason : reason
```

### 1.2 Relations

| Relation | Description |
|----------|-------------|
| `EvaluationSample` → `BotActionRef` | Liste des actions à évaluer (embedded) |
| `EvaluationSample` → `EvaluationsResult` | Calculé à la volée (non persisté) |
| `EvaluationSample` → `Evaluation` | 0 à N évaluations (créées seulement si évaluées) |
| `Evaluation` → `Dialog` | Référence au dialog existant (pas de snapshot) |

---

## 2. Collections MongoDB

### 2.1 Collection `evaluation_samples`

**Description :** Stocke les échantillons d'évaluation avec les références aux actions à évaluer.

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  
  // Identification
  "applicationName": "my-bot",
  "namespace": "my-namespace",
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  
  // Critères de sélection
  "dialogActivityFrom": ISODate("2026-01-01T00:00:00Z"),
  "dialogActivityTo": ISODate("2026-01-14T23:59:59Z"),
  "requestedDialogCount": 50,
  "allowTestDialogs": false,
  
  // Résultats de la sélection
  "dialogsCount": 50,
  "totalDialogCount": 120,
  "botActionCount": 125,
  
  // Références aux actions à évaluer (embedded)
  "botActionRefs": [
    { "dialogId": "dialog_abc123", "actionId": "action_001" },
    { "dialogId": "dialog_abc123", "actionId": "action_003" },
    { "dialogId": "dialog_def456", "actionId": "action_002" }
    // ... jusqu'à botActionCount éléments
  ],
  
  // Cycle de vie
  "status": "IN_PROGRESS",  // IN_PROGRESS | VALIDATED | CANCELLED
  
  // Création
  "createdBy": "user-id-123",
  "creationDate": ISODate("2026-01-14T10:30:00Z"),
  
  // Validation (nullable)
  "validatedBy": null,
  "validationDate": null,
  "validationComment": null,
  
  // Annulation (nullable)
  "cancelledBy": null,
  "cancelDate": null,
  "cancelComment": null,
  
  // Métadonnées
  "lastUpdateDate": ISODate("2026-01-14T10:30:00Z")
}
```

**Index :**

| Index | Champs | Type | Justification |
|-------|--------|------|---------------|
| `_id_` | `_id` | Primary | Par défaut MongoDB |
| `idx_app_ns_status` | `applicationName`, `namespace`, `status` | Compound | Liste des samples par app/namespace |
| `idx_creation_date` | `creationDate` | Single (DESC) | Tri par date, purge |
| `idx_status` | `status` | Single | Filtrage par statut |

```javascript
// Création des index
db.evaluation_samples.createIndex({ "applicationName": 1, "namespace": 1, "status": 1 })
db.evaluation_samples.createIndex({ "creationDate": -1 })
db.evaluation_samples.createIndex({ "status": 1 })
```

---

### 2.2 Collection `evaluations`

**Description :** Stocke les évaluations effectuées. Un document est créé uniquement quand une action est évaluée.

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  
  // Références
  "evaluationSampleId": ObjectId("507f1f77bcf86cd799439011"),
  "dialogId": "dialog_abc123",
  "actionId": "action_001",
  
  // Évaluation
  "evaluation": "OK",  // OK | KO
  "reason": null,      // Si KO : INACCURATE_ANSWER, HALLUCINATION, etc.
  
  // Évaluateur
  "evaluatedBy": "user-id-456",
  "evaluationDate": ISODate("2026-01-14T11:00:00Z"),
  
  // Métadonnées
  "creationDate": ISODate("2026-01-14T11:00:00Z"),
  "lastUpdateDate": ISODate("2026-01-14T11:00:00Z")
}
```

**Index :**

| Index | Champs | Type | Justification |
|-------|--------|------|---------------|
| `_id_` | `_id` | Primary | Par défaut MongoDB |
| `idx_sample_id` | `evaluationSampleId` | Single | Récupérer toutes les évaluations d'un sample |
| `idx_sample_dialog_action` | `evaluationSampleId`, `dialogId`, `actionId` | Compound + Unique | Unicité, recherche rapide |
| `idx_evaluation` | `evaluation` | Single | Stats par statut (OK/KO) |
| `idx_creation_date` | `creationDate` | Single (DESC) | Purge |

```javascript
// Création des index
db.evaluations.createIndex({ "evaluationSampleId": 1 })
db.evaluations.createIndex(
  { "evaluationSampleId": 1, "dialogId": 1, "actionId": 1 }, 
  { unique: true }
)
db.evaluations.createIndex({ "evaluation": 1 })
db.evaluations.createIndex({ "creationDate": -1 })
```

---

### 2.3 Collection existante `dialogs`

**Description :** Collection existante de Tock. Les évaluations référencent les dialogs sans duplication.

```javascript
{
  "_id": ObjectId("dialog_abc123"),
  "playerIds": [...],
  "stories": [...],
  "actions": [
    {
      "_id": "action_001",
      "playerId": { "type": "bot", ... },
      "date": ISODate("2026-01-10T14:30:00Z"),
      "message": {
        "text": "Bonjour, comment puis-je vous aider ?"
      }
    },
    {
      "_id": "action_002",
      "playerId": { "type": "user", ... },
      "date": ISODate("2026-01-10T14:30:05Z"),
      "message": {
        "text": "Je veux réserver un train"
      }
    }
    // ...
  ]
}
```

> ⚠️ **Attention :** Les dialogs peuvent être purgés. Si un dialog est supprimé, l'évaluation reste mais sans contexte.

---

## 3. Flux de données

### 3.1 Création du sample

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant Samples as evaluation_samples
    participant Dialogs as dialogs
    participant Annotations as annotations

    U->>UI: Remplit formulaire
    UI->>API: POST /evaluation-samples
    
    API->>Dialogs: find(période, applicationName)
    Dialogs-->>API: dialogs[]
    
    API->>Annotations: find(dialogIds)
    Annotations-->>API: annotatedDialogIds[]
    
    API->>API: Exclut dialogs annotés
    API->>API: Sélectionne N dialogs (aléatoire)
    API->>API: Extrait botActionRefs (actions bot)
    
    API->>Samples: insertOne(sample + botActionRefs)
    Samples-->>API: sample créé
    
    API-->>UI: 201 Created + sample
    UI-->>U: Affiche vue évaluation
```

### 3.2 Chargement des évaluations

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant Samples as evaluation_samples
    participant Evals as evaluations
    participant Dialogs as dialogs

    U->>UI: Ouvre un sample
    
    UI->>API: GET /evaluation-samples/:id
    API->>Samples: findOne(_id)
    Samples-->>API: sample (avec botActionRefs)
    
    API->>Evals: count(evaluationSampleId, evaluation=OK)
    API->>Evals: count(evaluationSampleId, evaluation=KO)
    API->>API: Calcule evaluationsResult
    
    API-->>UI: sample + evaluationsResult
    
    UI->>API: GET /evaluations?includeDialogs=true
    API->>Evals: find(evaluationSampleId).skip().limit()
    Evals-->>API: evaluations[]
    
    API->>Dialogs: find(dialogIds)
    Dialogs-->>API: dialogs[]
    
    API-->>UI: evaluations[] + dialogs[]
    
    UI->>UI: Fusionne botActionRefs + evaluations + dialogs
    UI-->>U: Affiche liste avec statut évaluation
```

### 3.3 Évaluer une action

```mermaid
sequenceDiagram
    participant E1 as Évaluateur 1
    participant E2 as Évaluateur 2
    participant UI as Interface
    participant API as API
    participant Evals as evaluations

    Note over E1,E2: Évaluations simultanées

    E1->>UI: Clique OK sur action A
    UI->>API: POST /evaluations {dialogId, actionId, evaluation: OK}
    API->>Evals: insertOne(evaluation)
    Note over API,Evals: Ou updateOne si déjà existe
    Evals-->>API: evaluation créée
    API-->>UI: 201 Created
    UI-->>E1: Rafraîchit statistiques

    E2->>UI: Clique KO sur action B
    UI->>API: POST /evaluations {dialogId, actionId, evaluation: KO, reason}
    API->>Evals: insertOne(evaluation)
    Evals-->>API: evaluation créée
    API-->>UI: 201 Created
    UI-->>E2: Rafraîchit statistiques
```

### 3.4 Modifier une évaluation

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant Evals as evaluations

    U->>UI: Modifie évaluation existante
    UI->>API: PATCH /evaluations/:id {evaluation: KO, reason}
    
    API->>Evals: findOneAndUpdate(_id, $set, returnDocument: after)
    
    alt Conflit (version)
        Evals-->>API: null (document modifié)
        API-->>UI: 409 Conflict
        UI-->>U: Message "Modifié par un autre utilisateur"
    else Succès
        Evals-->>API: evaluation mise à jour
        API-->>UI: 200 OK
        UI-->>U: Rafraîchit vue
    end
```

### 3.5 Validation

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant Samples as evaluation_samples
    participant Evals as evaluations

    U->>UI: Clique "Valider"
    UI->>UI: Affiche modal confirmation
    U->>UI: Confirme (+ commentaire)
    
    UI->>API: POST /validate {validationComment}
    
    API->>Samples: findOne(_id)
    Samples-->>API: sample (avec botActionRefs.length)
    
    API->>Evals: count(evaluationSampleId)
    Evals-->>API: evaluatedCount
    
    API->>API: Vérifie evaluatedCount == botActionRefs.length
    
    alt Évaluations manquantes
        API-->>UI: 422 Unprocessable Entity
        UI-->>U: "X évaluations restantes"
    else Toutes évaluées
        API->>Samples: updateOne(_id, status=VALIDATED, validatedBy, validationDate)
        Samples-->>API: OK
        API-->>UI: 200 OK
        UI-->>U: "Sample validé"
    end
```

### 3.6 Annulation

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant Samples as evaluation_samples

    U->>UI: Clique "Annuler"
    UI->>UI: Affiche modal confirmation
    U->>UI: Confirme (+ raison)
    
    UI->>API: POST /cancel {cancelComment}
    
    API->>Samples: findOne(_id)
    Samples-->>API: sample
    
    alt Déjà validé
        API-->>UI: 422 Unprocessable Entity
        UI-->>U: "Sample déjà validé"
    else Peut annuler
        API->>Samples: updateOne(_id, status=CANCELLED, cancelledBy, cancelDate)
        Samples-->>API: OK
        API-->>UI: 200 OK
        UI-->>U: "Sample annulé"
    end
```

---

## 4. Requêtes MongoDB fréquentes

### 4.1 Calculer evaluationsResult

```javascript
// Nombre d'évaluations par statut pour un sample
db.evaluations.aggregate([
  { $match: { evaluationSampleId: ObjectId("...") } },
  { $group: {
      _id: "$evaluation",
      count: { $sum: 1 }
  }}
])

// Résultat:
// [{ _id: "OK", count: 60 }, { _id: "KO", count: 20 }]
```

### 4.2 Vérifier si toutes les actions sont évaluées

```javascript
// Comparer botActionRefs.length avec le nombre d'évaluations
const sample = db.evaluation_samples.findOne({ _id: ObjectId("...") })
const evaluatedCount = db.evaluations.countDocuments({ 
  evaluationSampleId: sample._id 
})
const allEvaluated = evaluatedCount === sample.botActionRefs.length
```

### 4.3 Liste paginée des évaluations avec dialogs

```javascript
// Évaluations paginées
const evaluations = db.evaluations
  .find({ evaluationSampleId: ObjectId("...") })
  .skip(0)
  .limit(20)
  .toArray()

// Dialogs associés
const dialogIds = [...new Set(evaluations.map(e => e.dialogId))]
const dialogs = db.dialogs.find({ _id: { $in: dialogIds } }).toArray()
```

---

## 5. Points d'attention

1. **Performance** : La génération d'échantillon peut être lente si beaucoup de dialogs
2. **Concurrence** : Gérer les mises à jour simultanées (plusieurs évaluateurs)
3. **Rafraîchissement UI** : Polling ou WebSocket pour afficher les évaluations des autres
4. **Permissions** : Vérifier les droits d'accès (rôle `botUser`)
5. **Purge** : Les évaluations sans dialogs restent consultables mais sans contexte
6. **Taille botActionRefs** : Attention si beaucoup d'actions (limite document MongoDB 16MB)
