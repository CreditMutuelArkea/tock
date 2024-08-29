---
title: Gen AI / RAG
---

# Le menu _Gen AI / RAG_

## Configuration
Le menu _Gen AI / RAG_ (Retrieving augmented Generation) vous permet de choisir les modèles d'IA générative pris en charge par Tock et de configurer un ensemble de critères spécifiques à chaque fournisseur d'IA.
Cette fonctionnalité permettra à TOCK de générer une réponse à une requête de l'utilisateur, sur la base d'un ensemble de documents intégrés dans une base de données vectorielle.

> Pour accéder à cette page il faut bénéficier du rôle **_botUser_**.
> <br />( plus de détails sur les rôles dans [securité](../../../../admin/securite.md#rôles) ).

### Activation du RAG & Configuration du LLM Engine
![schéma Tock](../../../../img/gen-ai/gen-ai-settings-rag-llm.png "Ecran de configuration")

**RAG activation :**
- L’activation n’est possible qu’une fois que tous les champs marqués d’un * sont remplis.
- Une fois les champs remplis, choisir si oui ou non, le bot doit offrir l’option RAG.

**Un provider IA :** (LLM Engine)
- Cette section permet de paramétrer les options liées au modèle IA qui génère la réponse à l’utilisateur.
- Voir la [liste des fournisseurs d'IA](../providers/gen-ai-provider-llm-and-embedding.md)

**Température :**
- On peut définir une température située entre 0 et 1.
- Celle-ci permet de déterminer le niveau de créativité du Bot dans la réponse apportée à une requête qui lui est envoyée.

**Prompt :**
- Le prompt est le script qui détermine la personnalité du Bot, le contexte dans lequel il doit répondre, la façon dont il doit s’adresser à l’utilisateur, les recommandations ou instructions de réponses, les styles et formats de réponses.
 
### Embedding Engine & Gestion de la conversation 
![schéma Tock](../../../../img/gen-ai/gen-ai-settings-rag-embedding.png "Ecran de configuration")

**Un provider IA :** (Embedding Engine)
- Cette section permet de paramétrer les options liées au modèle IA qui interagit avec la base documentaire vectorisée.
- Voir la [liste des fournisseurs d'IA](../providers/gen-ai-provider-llm-and-embedding.md)

**Indexing session :**
- Renseigner l’ID de l’Indexing Session de votre base documentaire vectorisée

**Conversation Flow :**
- No rag sentences : Lorsque le LLM, via le prompt et sa base documentaire, n’arrive pas à apporter une réponse, il entre dans le Conversation Flow, ce qui permet d'activer une story particulière.
- Par exemple : “Désolé, je ne trouve aucune information documentaire pour vous répondre, souhaitez-vous parler à un conseiller ou reformuler votre question ?”

### Import d'une Story Unkown si le RAG est activé

![schéma Tock](../../../../img/gen-ai/gen-ai-rag-import-story-unknown.png "Ecran de choix")

**Attention :** Lorsqu’on importe les Story d’un bot à l'autre, et que la RAG est activée en dans le bot recepteur, un message d’avertissement apparait concernant la Story Unknown (Story qui permet au Bot de répondre qu’il ne connait pas la réponse à une question). 
- Deux options sont donc possibles :
  - Désactiver le RAG et permettre l’import de la Story Unknown.
  - Garder le RAG activé et importer la Story Unknown mais désactivée.

IMAGES
https://docs.google.com/document/d/1NrLDxbNt2iTUjBYuNXVKBWA_QOL34EgPY5Pl_MRzvs0/edit

RAG Exclusion

Le menu Rag Exclusions permet d’exclure des sujets du périmètre de réponse du Bot.


En complément du prompt, il permet de limiter les réponses du bot afin qu’il reste dans son périmètre d’action et ne crée pas de réponse trop inventive.
Pour ajouter des sujets ou phrases que le bot ne doit pas traiter :
Aller dans FAQ Training
Sélectionner la phrase que vous souhaitez exclure
Cliquer sur “Exclude from RAG handling”

Sur la page RAG Exclusion, retrouvez l’ensemble des phrases / sujets qui ont été exclu des réponses du Bot.
