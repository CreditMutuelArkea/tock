---
title: Gen AI / Sentence Generation
---

# Le menu _Gen AI / Sentence Generation_

Le menu _Gen AI / Sentence Generation_ permet de générer via IA Générative, des phrases d'entraînement pour les bots FAQ.

Pour activer la sentence generation, il faut : 
Un provider IA (ex: Azure Open AI), puis remplir les champs de sa configuration :
- API key
- API Version
- Deployment name
- Base URL

Température : 
- C’est la température qui apparaîtra par défaut lors de la création des phrases d'entraînement.
- Elle Permet de définir le degré d’inventivité du modèle utilisé pour générer des phrases. 
- Elle est situé entre 0 et 1.0. 
  - 0 = pas de latitude dans la création des phrases 
  - 1.0 = Plus grande latitude dans la création des phrases.

Prompt :
- Encadré dans lequel inclure le prompt qui permet la génération de nouvelles phrases d'entraînement.

Nombre de phrases : 
- Défini le nombre de phrases d'entraînement générées par chaque requête.


> Pour accéder à cette page il faut bénéficier du rôle _nlpUser_. ( plus de détails sur les rôles dans [securité](../../../admin/securite.md#rôles) ).


https://docs.google.com/document/d/12UwD9tJNiL-cUEKLddpKYIFtPMhVOnpwiMDPDfHD7eE/edit

TODO MASS
![schéma Tock](../../../img/ecran_faq.png "Ecran de configuration")


Le Menu FAQ Management

Pour utiliser l’option Generate Sentence :

Sélectionner une phrase qui servira de base d'entraînement.
Cliquer sur Modifier puis sur Questions:

Cliquer sur l’ampoule, une fenêtre avec de nouveaux paramètres apparaît :

TODO IMAGE

Choisir la ou les questions qui serviront de base d'entraînement.
Choisir si l’IA doit inclure des fautes d’orthographe, du langage de type SMS et des abréviations.
La température par défaut est celle qui a été choisie dans les Settings mais elle peut être modifiée ici selon le besoin.
Cliquer sur Generate.

L’IA va générer une liste de variantes de la question sélectionnée pour l'entraînement.
Sélectionner les variantes les plus appropriées à la requête et valider la sélection.

Les phrases  issues de la session d'entraînement apparaîtront alors dans les questions de la FAQ.

------------ TODO MASS ------------------------
Rendez-vous dans [Menu _FAQ Management_](../faq-management) pour la suite du manuel utilisateur. 

> Vous pouvez aussi passer directement au chapitre suivant : [Développement](../../../dev/modes). 