---
title: Gen AI / Sentence Generation
---

# Le menu _Gen AI / Sentence Generation_

Le menu _Gen AI / RAG_ (Retrieving augmented Generation) permet de paramétrer les critères d’utilisation des options d’IA générative intégrées au Bot
Le RAG permet à l’IA de générer une réponse à une requête en se basant sur un ensemble de documents, intégrés à une base vectorielle.

Cette page sert à intégrer toutes les données de connexion et le prompt qui permettront au modèle d’IA de générer ses réponses, de la façon souhaitée.





> Pour accéder à cette page il faut bénéficier du rôle _nlpUser_. ( plus de détails sur les rôles dans [securité](../../../admin/securite.md#rôles) ).


![schéma Tock](../../../img/ecran_faq.png "Ecran de configuration")


RAG Exclusion

Le menu Rag Exclusions permet d’exclure des sujets du périmètre de réponse du Bot.


En complément du prompt, il permet de limiter les réponses du bot afin qu’il reste dans son périmètre d’action et ne crée pas de réponse trop inventive.
Pour ajouter des sujets ou phrases que le bot ne doit pas traiter :
Aller dans FAQ Training
Sélectionner la phrase que vous souhaitez exclure
Cliquer sur “Exclude from RAG handling”

Sur la page RAG Exclusion, retrouvez l’ensemble des phrases / sujets qui ont été exclu des réponses du Bot.


RAG Settings
Cette section permet de paramétrer toutes les options en lien avec l’IA générative qui répondra aux questions des utilisateurs.

RAG activation
L’activation n’est possible qu’une fois que tous les champs marqués d’un * sont remplis.
Une fois les champs remplis, choisir si oui ou non, le bot doit offrir l’option RAG.

Il faut 2 clés pour connecter le bot au modèle IA qui va générer les réponses.
La première est la clé LLM, la seconde la clé d’Embedding.

LLM Engine

Cette section permet de paramétrer les options liées au modèle IA qui génère la réponse à l’utilisateur.
Faire un choix entre les modèles Open AI ou Azure Open AI
Renseigner la clé d’API
Renseigner l’API version
Renseigner Deployment name
Renseigner Private endpoint

Température : On peut définir une température située entre 0 et 1.
Celle-ci permet de déterminer le niveau de créativité du Bot dans la réponse apportée à une requête qui lui est envoyée.

Prompt : Le prompt est le script qui détermine la personnalité du Bot, le contexte dans lequel il doit répondre, la façon dont il doit s’adresser à l’utilisateur, les recommandations ou instructions de réponses, les styles et formats de réponses.
Celui-ci doit être inséré dans la fenêtre dédiée.


Embedding Engine

Cette section permet de paramétrer les options liées au modèle IA qui interagit avec la base documentaire vectorisée.

Faire un choix entre les modèles Open AI ou Azure Open AI
Renseigner la clé d’API
Renseigner l’API version
Renseigner Deployment name
Renseigner Private endpoint

Indexing session
Renseigner l’ID de l’Indexing Session de votre base documentaire vectorisée

Conversation Flow
No rag sentences : Lorsque le LLM, via le prompt et sa base documentaire, n’arrive pas à apporter une réponse, il entre dans le Conversation Flow, ce qui permet d'activer une story particulière.

Par exemple
“Désolé, je ne trouve aucune information documentaire pour vous répondre, souhaitez-vous parler à un conseiller ou reformuler votre question ?”


Lorsqu’on importe les Story d’un bot depuis la Recette vers la Prod, et que la RAG est activée en Prod, un message d’avertissement apparait concernant la Story Unknown (Story qui permet au Bot de répondre qu’il ne connait pas la réponse à une question)


options :
Désactiver le RAG en prod et permettre l’import de la Story Unknown
Garder le RAG activé et désactiver la Story Unknown

IMAGES
https://docs.google.com/document/d/1NrLDxbNt2iTUjBYuNXVKBWA_QOL34EgPY5Pl_MRzvs0/edit


------------ TODO MASS ------------------------
Rendez-vous dans [Menu _FAQ Management_](../faq-management) pour la suite du manuel utilisateur. 

> Vous pouvez aussi passer directement au chapitre suivant : [Développement](../../../dev/modes). 