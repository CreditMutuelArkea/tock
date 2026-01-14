# Spécification technique

## 1. Diagramme de classes

### 1.1 Modèle conceptuel

```mermaid
classDiagram
    class EvaluationSample {
        +String id
        +String applicationId
        +String name
        +String description
        +Instant startDate
        +Instant endDate
        +int requestedDialogCount
        +boolean includeTestDialogs
        +EvaluationSampleStatus status
        +String createdBy
        +Instant creationDate
        +String validatedBy
        +Instant validatedDate
        +Instant lastUpdateDate
    }

    class BotResponse {
        +String id
        +String sampleId
        +String dialogId
        +String actionId
        +String botMessage
        +String userMessage
        +Instant date
    }

    class Evaluation {
        +String id
        +String botResponseId
        +EvaluationStatus status
        +EvaluationReason reason
        +String comment
        +String evaluatedBy
        +Instant creationDate
        +Instant lastModifiedAt
    }

    class EvaluationSampleStatus {
        <<enumeration>>
        CREATED
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

    EvaluationSample "1" *-- "many" BotResponse : contient
    BotResponse "1" -- "0..1" Evaluation : évaluée par
    EvaluationSample --> EvaluationSampleStatus : status
    Evaluation --> EvaluationStatus : status
    Evaluation --> EvaluationReason : reason
```

### 1.2 Relations

| Relation | Description |
|----------|-------------|
| `EvaluationSample` → `BotResponse` | Un sample contient plusieurs réponses du bot |
| `BotResponse` → `Evaluation` | Une réponse peut avoir une évaluation (0 ou 1) |

---

## 2. Options de stockage

Les dialogs et actions peuvent être **purgés**. Les échantillons seront également purgés.

### 2.1 Option B : Snapshot dans le Sample

Les réponses du bot sont stockées dans une collection séparée liée au sample.

```mermaid
classDiagram
    class EvaluationSample {
        +String id
        +String applicationId
        +String name
        +EvaluationSampleStatus status
    }

    class BotResponseSnapshot {
        +String id
        +String sampleId
        +String dialogId
        +String actionId
        +String botMessage
        +String userMessage
        +Instant originalDate
        +Instant snapshotDate
    }

    class ActionEvaluation {
        +String id
        +String sampleId
        +String botResponseId
        +EvaluationStatus status
        +EvaluationReason reason
        +String comment
        +String evaluatedBy
        +Instant creationDate
    }

    EvaluationSample "1" *-- "many" BotResponseSnapshot : snapshots
    BotResponseSnapshot "1" -- "0..1" ActionEvaluation : évaluation
```

**Avantages :**
- ✅ Séparation claire snapshot / évaluation
- ✅ Une seule copie par réponse par sample

**Inconvénients :**
- ❌ Deux collections à gérer (snapshots + évaluations)

---

### 2.2 Option C : Évaluations avec contenu intégré

Les évaluations contiennent directement le snapshot du message.

```mermaid
classDiagram
    class EvaluationSample {
        +String id
        +String applicationId
        +String name
        +EvaluationSampleStatus status
        +List~BotResponseRef~ botResponseRefs
    }

    class BotResponseRef {
        +String dialogId
        +String actionId
    }

    class ActionEvaluation {
        +String id
        +String sampleId
        +String dialogId
        +String actionId
        +String botMessage
        +String userMessage
        +Instant originalDate
        +EvaluationStatus status
        +EvaluationReason reason
        +String comment
        +String evaluatedBy
        +Instant creationDate
    }

    EvaluationSample "1" *-- "many" BotResponseRef : références
    EvaluationSample "1" -- "many" ActionEvaluation : évaluations
```

**Avantages :**
- ✅ Une seule collection pour tout (évaluations)
- ✅ Données auto-portantes
- ✅ Plus simple à requêter

**Inconvénients :**
- ❌ Données dupliquées si plusieurs samples incluent la même réponse

---

### 2.3 Comparaison

| Critère | Option B | Option C |
|---------|----------|----------|
| **Collections** | 3 | 2 |
| **Duplication** | Faible | Possible |
| **Complexité** | Moyenne | Faible |
| **Requêtes** | Jointures | Directes |

---

## 3. Flux de données

### 3.1 Création du sample

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant DB as Base de données

    U->>UI: Remplit formulaire
    UI->>API: POST /evaluation-samples
    API->>DB: Récupère dialogs (période)
    API->>DB: Récupère dialogs annotés
    API->>API: Exclut dialogs annotés
    API->>API: Sélectionne N dialogs
    API->>API: Extrait réponses du bot
    API->>API: Snapshot des messages
    API->>DB: Crée sample + réponses
    API-->>UI: Sample créé
    UI-->>U: Affiche vue évaluation
```

### 3.2 Évaluation

```mermaid
sequenceDiagram
    participant E1 as Évaluateur 1
    participant E2 as Évaluateur 2
    participant UI as Interface
    participant API as API
    participant DB as Base de données

    Note over E1,E2: Évaluations simultanées

    E1->>UI: Clique OK sur réponse A
    UI->>API: POST /evaluate
    API->>DB: Crée/Met à jour évaluation
    API-->>UI: Évaluation enregistrée
    UI-->>E1: Rafraîchit statistiques

    E2->>UI: Clique KO sur réponse B
    UI->>API: POST /evaluate
    API->>DB: Crée/Met à jour évaluation
    API-->>UI: Évaluation enregistrée
    UI-->>E2: Rafraîchit statistiques
```

### 3.3 Validation

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API
    participant DB as Base de données

    U->>UI: Clique "Valider"
    UI->>UI: Affiche modal confirmation
    U->>UI: Confirme
    UI->>API: POST /validate
    API->>API: Vérifie toutes réponses évaluées
    
    alt Réponses manquantes
        API-->>UI: Erreur 400
        UI-->>U: Message erreur
    else Toutes évaluées
        API->>DB: status = VALIDATED
        API-->>UI: Sample validé
        UI-->>U: Confirmation
    end
```

---

## 4. Points d'attention

1. **Performance** : La génération d'échantillon peut être lente si beaucoup de dialogs
2. **Concurrence** : Gérer les mises à jour simultanées (plusieurs évaluateurs)
3. **Rafraîchissement UI** : Afficher les évaluations des autres utilisateurs en temps réel
4. **Permissions** : Vérifier les droits d'accès (rôle `botUser`)

