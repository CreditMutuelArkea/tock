# Réflexion : Quand créer les évaluations ?

## Contexte

Deux approches possibles pour gérer les évaluations :

| Option | Description |
|--------|-------------|
| **Option A** | Créer les évaluations vides à la création du sample |
| **Option B** | Créer les évaluations uniquement au moment de l'évaluation |

---

## Option A : Évaluations pré-créées (vides)

### Principe

À la création du sample, on crée N enregistrements `Evaluation` avec `evaluation = null`, `evaluatedBy = null`, etc.

```
POST /evaluation-samples
  → Crée sample
  → Crée 125 évaluations vides (une par action bot)
```

### Modèle de données

```kotlin
Evaluation(
    id = "eval_001",
    evaluationSampleId = "sample_123",
    dialogId = "dialog_abc",
    actionId = "action_001",
    evaluation = null,      // ❌ Pas encore évalué
    reason = null,
    evaluatedBy = null,     // ❌ Pas d'évaluateur
    evaluationDate = null
)
```

### Avantages

| # | Avantage |
|---|----------|
| 1 | **Front simplifié** : uniquement des PATCH, pas de POST |
| 2 | **Pagination simple** : on pagine sur les évaluations existantes |
| 3 | **Comptage facile** : `total = count(evaluations)`, `remaining = count(evaluation IS NULL)` |
| 4 | **Pas de jointure** : on ne requête que la collection `evaluations` |

### Inconvénients

| # | Inconvénient |
|---|--------------|
| 1 | **Entité sans sens métier** : une évaluation sans évaluation ni évaluateur, c'est quoi ? |
| 2 | **Données vides en BDD** : 125 lignes avec des nulls partout |
| 3 | **Création lente** : création du sample = création de N évaluations |
| 4 | **Rollback complexe** : si échec partiel, nettoyer les évaluations orphelines |
| 5 | **Couplage fort** : le sample "connaît" toutes les actions dès le départ |

---

## Option B : Évaluations créées à l'évaluation

### Principe

Le sample stocke les références aux actions à évaluer. L'évaluation est créée uniquement quand un évaluateur évalue.

```
POST /evaluation-samples
  → Crée sample avec liste de références (dialogId + actionId)

POST /evaluations (ou PUT)
  → Crée l'évaluation avec les vraies données
```

### Modèle de données

**EvaluationSample :**
```kotlin
EvaluationSample(
    id = "sample_123",
    // ...
    botActionRefs = [
        BotActionRef(dialogId = "dialog_abc", actionId = "action_001"),
        BotActionRef(dialogId = "dialog_abc", actionId = "action_003"),
        BotActionRef(dialogId = "dialog_def", actionId = "action_002"),
        // ...
    ]
)
```

**Evaluation (créée seulement si évaluée) :**
```kotlin
Evaluation(
    id = "eval_001",
    evaluationSampleId = "sample_123",
    dialogId = "dialog_abc",
    actionId = "action_001",
    evaluation = "OK",           // ✅ Toujours renseigné
    reason = null,
    evaluatedBy = "user-123",    // ✅ Toujours renseigné
    evaluationDate = "2026-01-15T10:00:00Z"
)
```

### Avantages

| # | Avantage |
|---|----------|
| 1 | **Entité avec sens** : une évaluation = un jugement réel par un évaluateur |
| 2 | **Création rapide** : sample créé instantanément (juste les refs) |
| 3 | **Pas de nulls** : évaluation toujours complète |
| 4 | **DDD-friendly** : l'évaluation est un vrai "fait" métier |

### Inconvénients

| # | Inconvénient |
|---|--------------|
| 1 | **Front plus complexe** : POST pour créer, PATCH pour modifier |
| 2 | **Pagination complexe** : combiner refs du sample + évaluations existantes |
| 3 | **Comptage avec jointure** : `total = len(refs)`, `evaluated = count(evaluations)` |
| 4 | **UI : afficher les non-évalués** : requiert de croiser refs et évaluations |

---

## Comparaison détaillée

### Impact Backend

| Aspect | Option A (pré-créées) | Option B (à l'évaluation) |
|--------|----------------------|---------------------------|
| **Création sample** | Lente (N inserts) | Rapide (1 insert) |
| **Évaluer** | PATCH simple | POST ou PUT (upsert) |
| **Lister évaluations** | Simple `find(sampleId)` | Jointure refs ↔ évaluations |
| **Compter restants** | `count(evaluation IS NULL)` | `len(refs) - count(evaluations)` |
| **Transaction** | Complexe (sample + N evals) | Simple (sample seul) |

### Impact Frontend

| Aspect | Option A (pré-créées) | Option B (à l'évaluation) |
|--------|----------------------|---------------------------|
| **Afficher liste** | Directement les évaluations | Fusionner refs + évaluations |
| **Évaluer** | PATCH `/evaluations/:id` | POST `/evaluations` (avec dialogId + actionId) |
| **Modifier** | PATCH `/evaluations/:id` | PATCH `/evaluations/:id` |
| **Progression** | `evaluated / total` depuis les evals | Calculer côté front ou endpoint dédié |

### Impact API

**Option A :**
```
GET  /evaluation-samples/:id/evaluations     → Liste des évaluations (avec nulls)
PATCH /evaluation-samples/:id/evaluations/:id → Évaluer
```

**Option B :**
```
GET  /evaluation-samples/:id                  → Sample avec botActionRefs
GET  /evaluation-samples/:id/evaluations      → Évaluations existantes seulement
POST /evaluation-samples/:id/evaluations      → Créer une évaluation
PATCH /evaluation-samples/:id/evaluations/:id → Modifier une évaluation
```

Ou avec upsert :
```
PUT /evaluation-samples/:id/evaluations/:dialogId/:actionId → Créer ou modifier
```

---

## Proposition hybride (Option C)

### Principe

Garder les **refs dans le sample**, mais exposer une **vue fusionnée** côté API.

Le backend fait le travail de fusion, le front reçoit une liste uniforme.

### Modèle

```kotlin
// En BDD
EvaluationSample(
    id = "sample_123",
    botActionRefs = [ ... ]  // Liste des actions à évaluer
)

// Évaluations créées seulement si évaluées
Evaluation(
    id = "eval_001",
    evaluationSampleId = "sample_123",
    dialogId = "dialog_abc",
    actionId = "action_001",
    evaluation = "OK",
    evaluatedBy = "user-123",
    evaluationDate = "..."
)
```

### API

**1. Récupérer le sample (avec les refs)**

```
GET /evaluation-samples/:id

Response:
{
  "_id": "sample_123",
  "name": "Évaluation Q1 2026",
  "status": "IN_PROGRESS",
  // ... autres champs du sample ...
  
  "botActionRefs": [         // Les références aux actions à évaluer
    { "dialogId": "dialog_abc", "actionId": "action_001" },
    { "dialogId": "dialog_abc", "actionId": "action_003" },
    { "dialogId": "dialog_def", "actionId": "action_002" }
  ],
  
  "evaluationsResult": {     // Calculé à la volée
    "total": 125,
    "evaluated": 80,
    "remaining": 45,
    "positiveCount": 60,
    "negativeCount": 20
  }
}
```

**2. Récupérer les évaluations paginées (sans les refs)**

```
GET /evaluation-samples/:id/evaluations?start=0&size=20&includeDialogs=true

Response:
{
  "start": 0,
  "end": 20,
  "total": 80,               // Nombre d'évaluations faites (pas de refs ici)
  
  "evaluations": [           // Seulement les évaluations existantes
    {
      "id": "eval_001",
      "dialogId": "dialog_abc",
      "actionId": "action_001",
      "evaluation": "OK",
      "reason": null,
      "evaluatedBy": "user-123",
      "evaluationDate": "2026-01-15T10:00:00Z"
    }
  ],
  
  "dialogs": [               // Si includeDialogs=true
    {
      "_id": "dialog_abc",
      "actions": [
        { "_id": "action_001", "text": "Bonjour, comment puis-je vous aider ?", ... },
        { "_id": "action_003", "text": "Voici les horaires...", ... }
      ]
    },
    {
      "_id": "dialog_def",
      "actions": [
        { "_id": "action_002", "text": "Je n'ai pas compris.", ... }
      ]
    }
  ]
}
```

**Logique front :**
```javascript
// 1. Charger le sample une fois (avec botActionRefs)
const sample = await fetch('/evaluation-samples/:id');

// 2. Charger les évaluations paginées
const page = await fetch('/evaluation-samples/:id/evaluations?includeDialogs=true');

// 3. Fusionner : pour chaque ref, chercher l'évaluation correspondante
sample.botActionRefs.map(ref => {
  const evaluation = page.evaluations.find(e => 
    e.dialogId === ref.dialogId && e.actionId === ref.actionId
  );
  const dialog = page.dialogs.find(d => d._id === ref.dialogId);
  const action = dialog?.actions.find(a => a._id === ref.actionId);
  
  return {
    ref,
    action,          // Le contenu du message
    evaluation       // null si pas encore évalué
  };
});
```

### Évaluer

```
POST /evaluation-samples/:id/evaluations
{
  "dialogId": "dialog_abc",
  "actionId": "action_003",
  "evaluation": "KO",
  "reason": "HALLUCINATION"
}

Response 201:
{
  "id": "eval_002",
  "dialogId": "dialog_abc",
  "actionId": "action_003",
  "evaluation": "KO",
  "reason": "HALLUCINATION",
  "evaluatedBy": "user-456",
  "evaluationDate": "2026-01-15T11:00:00Z"
}
```

### Modifier une évaluation

```
PATCH /evaluation-samples/:id/evaluations/:evalId
{
  "evaluation": "OK",
  "reason": null
}
```

### Avantages

- ✅ Entités avec sens métier (pas de nulls en BDD)
- ✅ Création du sample rapide (juste les refs)
- ✅ Séparation claire : refs (dans sample) / évaluations / dialogs
- ✅ `botActionRefs` chargé une seule fois avec le sample
- ✅ Pagination légère (pas de refs dupliqués à chaque page)
- ✅ Dialogs chargés uniquement si besoin (`includeDialogs=true`)

### Inconvénients

- ❌ Front doit faire la fusion (refs ↔ évaluations ↔ dialogs)
- ❌ POST pour créer, PATCH pour modifier (2 verbes)
- ❌ 2 appels nécessaires : sample + évaluations

---

## Recommandation

| Critère | Option A | Option B | Option C |
|---------|----------|----------|----------|
| **Sens métier** | ❌ | ✅ | ✅ |
| **Simplicité front** | ✅ | ❌ | ⚠️ (fusion) |
| **Simplicité back** | ✅ | ⚠️ | ✅ |
| **Performance création** | ❌ | ✅ | ✅ |
| **Maintenabilité** | ⚠️ | ✅ | ✅ |
| **Séparation des données** | ❌ | ✅ | ✅ |

**Mon avis :** 
- **Option A** si la simplicité front est prioritaire et que les "évaluations vides" sont acceptables.
- **Option C** si le sens métier compte et que le front peut gérer la fusion (refs ↔ evaluations ↔ dialogs).

La fusion côté front est un pattern courant (comme pour les commentaires sur des posts), donc pas insurmontable.

---

## À trancher

1. Est-ce qu'une "évaluation vide" a un sens métier acceptable ?
2. Le front peut-il gérer la fusion (refs + évaluations) ?
3. La performance de création du sample est-elle critique ?

