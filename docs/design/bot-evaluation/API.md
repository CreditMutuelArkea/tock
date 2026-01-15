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
| `namespace` | string | Non | Filtrer par application |
| `status` | string | Non | Filtrer par statut (`IN_PROGRESS`, `VALIDATED`, "CANCELLED") par defaut les 2 premiers |

### Response 200

```json

```

---

## 2. Créer un échantillon

**POST** `/bot/evaluation-samples`

| `name` | Nom optionnel pour identifier l'échantillon |
| `description` | Description libre de l'objectif de l'évaluation |
| `dialogActivityFrom et dialogActivityTo` | Période de sélection avec un dialogeu ayant eu une activité pendant la période|
| `requestedDialogCount` | Nombre de dialogs demandés |
| `allowTestDialogs` | Autoriser ou non les dialogs de test |

//user recuperer depuis le contexte


### Request Body

```json
{

}
```

### Response 201

```json

```
plus id
| `name` | Nom optionnel pour identifier l'échantillon |
| `description` | Description libre de l'objectif de l'évaluation |
| `dialogActivityFrom et dialogActivityTo` | Période de sélection avec un dialogeu ayant eu une activité pendant la période|
| `requestedDialogCount` | Nombre de dialogs demandés |
| `dialogsCount` | Nombre de dialogs retourné, peut différer du requested dans le cas ou pas assez de dialogs |

| `totalDialogCount` | Nombre de dialog total dans la periode, indépendemment de la limite requestedDialogCount de l'echantillonnage |

| `botActionCount` | nombre de total de action de bot retourné|
| `allowTestDialogs` | Autoriser ou non les dialogs de test |
| `status` | État de l'échantillon |
| `createdBy` | Utilisateur ayant créé l'échantillon |
| `creationDate` | Utilisateur ayant créé l'échantillon |
| `createdBy` | Utilisateur ayant créé l'échantillon |
| `validationDate` | Utilisateur ayant validé l'évaluation |
| `cancelDate` | Utilisateur ayant validé l'évaluation |
| `cancelledBy` | Utilisateur ayant validé l'évaluation |
---

## 3. Récupérer un échantillon

**GET** `/bot/evaluation-samples/:sampleId`

Retourne l'échantillon avec toutes les réponses et leurs évaluations.

### Response 200

```
plus id
| `name` | Nom optionnel pour identifier l'échantillon |
| `description` | Description libre de l'objectif de l'évaluation |
| `dialogActivityFrom et dialogActivityTo` | Période de sélection avec un dialogeu ayant eu une activité pendant la période|
| `requestedDialogCount` | Nombre de dialogs demandés |
| `dialogsCount` | Nombre de dialogs retourné, peut différer du requested dans le cas ou pas assez de dialogs |

| `totalDialogCount` | Nombre de dialog total dans la periode, indépendemment de la limite requestedDialogCount de l'echantillonnage |

| `botActionCount` | nombre de total de action de bot retourné|
| `allowTestDialogs` | Autoriser ou non les dialogs de test |
| `status` | État de l'échantillon |
| `createdBy` | Utilisateur ayant créé l'échantillon |
| `creationDate` | Utilisateur ayant créé l'échantillon |
| `createdBy` | Utilisateur ayant créé l'échantillon |
| `validationDate` | Utilisateur ayant validé l'évaluation |
| `cancelDate` | Utilisateur ayant validé l'évaluation |
| `cancelledBy` | Utilisateur ayant validé l'évaluation |
---


## 5. Récuperer les dialogs et les evaluations paginé

 POST : `/bot/evaluation-samples/:sampleId/evaluations/list`



### payload Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `applicationName` | string | Non | Filtrer par application |
| `namespace` | string | Non | Filtrer par application |
| `status` | string | Non | Filtrer par statut (`IN_PROGRESS`, `VALIDATED`, "CANCELLED") par defaut les 2 premiers |
size ,start
includeDialogs


response:

start
end
total --> nombre d'evaluation pas de dialog
dialogs
evaluations


## 5. Évaluer une réponse

**PATCH** `/bot/evaluation-samples/:sampleId/evaluations/:idEvaluation`

### Request Body - OK

```json
{
| Attribut | Description |
|----------|-------------|
| `evalution` | OK ou KO |
| `reason` | Raison du KO , null si OK|
}
```
recuperer le userId dans le contexte... 


### Response 200

| Attribut | Description |
|----------|-------------|
| `evalution` | OK ou KO - nullable|
| `reason` | Raison du KO - nullable |
| `evaluatedBy` | Utilisateur ayant évalué - nullable |
| `evaluationDate` | Utilisateur ayant évalué lable |
| `dialogId` | Référence au dialog d'origine |
| `actionId` | Référence à l'action d'origine |
| `evaluationSampleId` | Référence à l'echantillon|
+id



## 7. Valider l'évaluation

**POST** `/bot/evaluation-samples/:sampleId/validate`

Toutes les réponses doivent être évaluées.

| `validationComment` | Description libre de l'evaluation de l'évaluation |




### Response 200



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
| `GET` | `/bot/evaluation-samples/:id` | Récupérer un échantillon (avec réponses et évaluations) |
| `POST` | `/bot/evaluation-samples/:id/start` | Démarrer l'évaluation |
| `POST` | `/bot/evaluation-samples/:id/evaluate` | Évaluer une réponse |
| `GET` | `/bot/evaluation-samples/:id/statistics` | Statistiques |
| `POST` | `/bot/evaluation-samples/:id/validate` | Valider l'évaluation |

