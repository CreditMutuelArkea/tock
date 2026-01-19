# Spécification fonctionnelle

Ce document décrit les flux fonctionnels avec les appels API, les statuts et retours possibles.

---

## 1. Création d'un ensemble d'évaluation

### Flux

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Remplit formulaire (période, nb dialogs, ...)
    UI->>API: POST /bots/:botId/evaluation-sets
    
    alt Succès
        API-->>UI: 201 Created
        Note right of API: { _id, status: "IN_PROGRESS", evaluationsResult, ... }
        UI-->>U: Affiche vue évaluation
    else Pas de dialogs trouvés
        API-->>UI: 422 Unprocessable Entity
        Note right of API: { error: "No dialogs found for the specified period" }
        UI-->>U: Message d'erreur
    else Erreur serveur
        API-->>UI: 500 Internal Server Error
        UI-->>U: Message d'erreur technique
    end
```

### Appel API

```http
POST /bots/my-bot/evaluation-sets
Content-Type: application/json

{
  "name": "Évaluation Q1 2026",
  "description": "Vérification qualité avant mise en prod",
  "dialogActivityFrom": "2026-01-01T00:00:00Z",
  "dialogActivityTo": "2026-01-14T23:59:59Z",
  "requestedDialogCount": 50,
  "allowTestDialogs": false
}
```

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 201 | Succès | Ensemble créé avec `evaluationsResult` |
| 422 | Aucun dialog trouvé | `{ error: "No dialogs found..." }` |
| 422 | Période invalide | `{ error: "Invalid date range" }` |
| 500 | Erreur technique | `{ error: "Internal server error" }` |

---

## 2. Liste des ensembles

### Flux

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Accède à la page d'évaluation
    UI->>API: GET /bots/:botId/evaluation-sets
    
    API-->>UI: 200 OK
    Note right of API: [ { _id, name, status, evaluationsResult, ... }, ... ]
    UI-->>U: Affiche liste des ensembles
```

### Appel API

```http
GET /bots/my-bot/evaluation-sets?status=IN_PROGRESS
```

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 200 | Succès | Liste des ensembles (peut être vide `[]`) |

---

## 3. Récupération d'un ensemble

### Flux

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique sur un ensemble
    UI->>API: GET /bots/:botId/evaluation-sets/:setId
    
    alt Trouvé
        API-->>UI: 200 OK
        Note right of API: { _id, status, evaluationsResult, ... }
        UI-->>U: Affiche détails de l'ensemble
    else Non trouvé
        API-->>UI: 404 Not Found
        UI-->>U: Message "Ensemble non trouvé"
    end
```

### Appel API

```http
GET /bots/my-bot/evaluation-sets/507f1f77bcf86cd799439011
```

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 200 | Succès | Ensemble avec `evaluationsResult` |
| 404 | Non trouvé | `{ error: "Evaluation set not found" }` |

---

## 4. Récupération des bot-refs (paginé)

### Flux - Chargement initial

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Ouvre la vue évaluation
    
    UI->>API: GET /bots/:botId/evaluation-sets/:id/bot-refs?start=0&size=20&includeDialogs=true&includeEvaluations=true
    
    API-->>UI: 200 OK
    Note right of API: { botRefs[], dialogs: { found[], missing[] } }
    
    UI-->>U: Affiche page 1 des évaluations
```

### Flux - Pagination

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "Page suivante"
    
    UI->>API: GET /bots/:botId/evaluation-sets/:id/bot-refs?start=20&size=20&includeDialogs=true&includeEvaluations=true
    
    API-->>UI: 200 OK
    Note right of API: { botRefs[], dialogs: { found[], missing[] } }
    
    UI-->>U: Affiche page 2
```

### Flux - Filtrage par statut

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Filtre "Non évalués uniquement"
    
    UI->>API: GET /bots/:botId/evaluation-sets/:id/bot-refs?start=0&size=20&status=UNSET&includeDialogs=true&includeEvaluations=true
    
    API-->>UI: 200 OK
    Note right of API: { botRefs[] (filtrés), dialogs: { found[], missing[] } }
    
    UI-->>U: Affiche uniquement les UNSET
```

### Appel API

```http
GET /bots/my-bot/evaluation-sets/507f1f77bcf86cd799439011/bot-refs?start=0&size=20&includeDialogs=true&includeEvaluations=true&status=UNSET
```

### Query Parameters

| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `start` | int | 0 | Index de début |
| `size` | int | 20 | Nombre d'éléments |
| `includeDialogs` | boolean | false | Inclure les dialogs |
| `includeEvaluations` | boolean | true | Inclure les évaluations |
| `status` | string | - | Filtrer par `UNSET`, `UP`, `DOWN` |

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 200 | Succès | `{ start, end, total, botRefs[], dialogs: { found[], missing[] } }` |
| 404 | Set non trouvé | `{ error: "Evaluation set not found" }` |

---

## 5. Évaluer une réponse

### Flux - Évaluation UP

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "UP" sur une réponse
    UI->>API: PATCH /bots/:botId/evaluation-sets/:setId/evaluations/:evalId
    Note right of UI: { status: "UP" }
    
    alt Succès
        API-->>UI: 200 OK
        Note right of API: { _id, status: "UP", evaluator: {...}, ... }
        UI-->>U: Met à jour l'affichage + statistiques
    else Conflit
        API-->>UI: 409 Conflict
        UI-->>U: "Modifié par un autre utilisateur"
    else Set validé/annulé
        API-->>UI: 422 Unprocessable Entity
        Note right of API: { error: "Cannot evaluate: set is VALIDATED" }
        UI-->>U: "L'ensemble est déjà validé"
    end
```

### Flux - Évaluation DOWN avec raison

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "DOWN" sur une réponse
    UI->>UI: Affiche liste des raisons (optionnel)
    U->>UI: Sélectionne "HALLUCINATION"
    
    UI->>API: PATCH /bots/:botId/evaluation-sets/:setId/evaluations/:evalId
    Note right of UI: { status: "DOWN", reason: "HALLUCINATION" }
    
    API-->>UI: 200 OK
    Note right of API: { _id, status: "DOWN", reason: "HALLUCINATION", evaluator: {...}, ... }
    UI-->>U: Met à jour l'affichage + statistiques
```

### Flux - Modification d'une évaluation

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Change évaluation (UP → DOWN)
    UI->>API: PATCH /bots/:botId/evaluation-sets/:setId/evaluations/:evalId
    Note right of UI: { status: "DOWN", reason: "INCOMPLETE_ANSWER" }
    
    alt Succès
        API-->>UI: 200 OK
        UI-->>U: Met à jour l'affichage
    else Conflit concurrent
        API-->>UI: 409 Conflict
        Note right of API: { error: "Conflict: evaluation was modified by another user" }
        UI-->>U: Propose de rafraîchir
    end
```

### Appel API

```http
PATCH /bots/my-bot/evaluation-sets/507f1f77bcf86cd799439011/evaluations/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "status": "DOWN",
  "reason": "HALLUCINATION"
}
```

### Request Body

| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Oui | `UP` ou `DOWN` |
| `reason` | string | Non | Raison du DOWN |

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 200 | Succès | Évaluation mise à jour |
| 404 | Évaluation non trouvée | `{ error: "Evaluation not found" }` |
| 409 | Conflit concurrent | `{ error: "Conflict: evaluation was modified..." }` |
| 422 | Set validé/annulé | `{ error: "Cannot evaluate: set is VALIDATED" }` |

---

## 6. Validation d'un ensemble

### Flux - Succès

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "Valider"
    UI->>UI: Affiche modal confirmation
    U->>UI: Confirme + ajoute commentaire
    
    UI->>API: POST /bots/:botId/evaluation-sets/:id/change-status
    Note right of UI: { targetStatus: "VALIDATED", comment: "..." }
    
    API-->>UI: 200 OK
    Note right of API: { _id, status: "VALIDATED", statusChangedBy, statusChangeDate, ... }
    UI-->>U: "Ensemble validé avec succès"
```

### Flux - Évaluations manquantes

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "Valider"
    UI->>API: POST /bots/:botId/evaluation-sets/:id/change-status
    Note right of UI: { targetStatus: "VALIDATED" }
    
    API-->>UI: 422 Unprocessable Entity
    Note right of API: { error: "All bot responses must be evaluated...", details: { remaining: 5, total: 125 } }
    
    UI-->>U: "5 évaluations restantes sur 125"
```

### Appel API

```http
POST /bots/my-bot/evaluation-sets/507f1f77bcf86cd799439011/change-status
Content-Type: application/json

{
  "targetStatus": "VALIDATED",
  "comment": "Évaluation complète, bot validé pour mise en prod"
}
```

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 200 | Succès | Ensemble avec nouveau statut |
| 404 | Set non trouvé | `{ error: "Evaluation set not found" }` |
| 422 | Évaluations manquantes | `{ error: "All bot responses must be evaluated...", details: { remaining, total } }` |
| 422 | Déjà validé/annulé | `{ error: "Invalid status transition", details: { currentStatus, targetStatus, allowedTransitions } }` |

---

## 7. Annulation d'un ensemble

### Flux - Succès

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "Annuler"
    UI->>UI: Affiche modal confirmation
    U->>UI: Confirme + ajoute raison
    
    UI->>API: POST /bots/:botId/evaluation-sets/:id/change-status
    Note right of UI: { targetStatus: "CANCELLED", comment: "Période incorrecte" }
    
    API-->>UI: 200 OK
    Note right of API: { _id, status: "CANCELLED", statusChangedBy, statusChangeDate, ... }
    UI-->>U: "Ensemble annulé"
```

### Flux - Déjà validé

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API

    U->>UI: Clique "Annuler"
    UI->>API: POST /bots/:botId/evaluation-sets/:id/change-status
    Note right of UI: { targetStatus: "CANCELLED" }
    
    API-->>UI: 422 Unprocessable Entity
    Note right of API: { error: "Invalid status transition", details: { currentStatus: "VALIDATED", allowedTransitions: [] } }
    
    UI-->>U: "Impossible d'annuler un ensemble validé"
```

### Appel API

```http
POST /bots/my-bot/evaluation-sets/507f1f77bcf86cd799439011/change-status
Content-Type: application/json

{
  "targetStatus": "CANCELLED",
  "comment": "Période d'évaluation incorrecte"
}
```

### Réponses possibles

| Code | Cas | Body |
|------|-----|------|
| 200 | Succès | Ensemble avec nouveau statut |
| 404 | Set non trouvé | `{ error: "Evaluation set not found" }` |
| 422 | Déjà validé | `{ error: "Invalid status transition", details: { currentStatus, allowedTransitions } }` |

---

## 8. Résumé des codes de retour

| Code | Signification | Cas d'usage |
|------|---------------|-------------|
| 200 | OK | Requête réussie (GET, PATCH, POST change-status) |
| 201 | Created | Création réussie (POST création) |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit de modification concurrente |
| 422 | Unprocessable Entity | Règle métier non respectée |
| 500 | Internal Server Error | Erreur technique |

---

## 9. Résumé des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/bots/:botId/evaluation-sets` | Liste des ensembles |
| `POST` | `/bots/:botId/evaluation-sets` | Créer un ensemble |
| `GET` | `/bots/:botId/evaluation-sets/:id` | Récupérer un ensemble |
| `GET` | `/bots/:botId/evaluation-sets/:id/bot-refs` | Liste des bot-refs paginée |
| `PATCH` | `/bots/:botId/evaluation-sets/:id/evaluations/:evalId` | Évaluer une réponse |
| `POST` | `/bots/:botId/evaluation-sets/:id/change-status` | Changer le statut |
