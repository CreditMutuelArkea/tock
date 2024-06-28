---
title: Gen AI - Sentence generation settings
---

# Le menu _Gen AI - Sentence generation settings_

Le menu _Gen AI - Sentence Generation_ permet de configurer la fonctionnalité de génération de phrases d'entraînement pour les bots FAQ.

> Pour accéder à cette page il faut bénéficier du rôle **_botUser_**. 
> <br />( plus de détails sur les rôles dans [securité](../../../../admin/securite.md#rôles) ).

![schéma Tock](../../../../img/gen-ai/gen-ai-settings-sentence-generation.png "Ecran de configuration")

Pour activer la fonction de génération de phrases, vous devez choisir :

**Un provider IA :**
- Voir la [liste des fournisseurs d'IA](../providers/gen-ai-provider-ai-llm.md) 


**Une température :** 
- C’est la température qui apparaîtra par défaut lors de la création des phrases d'entraînement.
- Elle Permet de définir le degré d’inventivité du modèle utilisé pour générer des phrases. 
- Elle est situé entre 0 et 1.0. 
  - 0 = pas de latitude dans la création des phrases 
  - 1.0 = Plus grande latitude dans la création des phrases.

**Un prompt :**
- Encadré dans lequel inclure le prompt qui permet la génération de nouvelles phrases d'entraînement.

**Le nombre de phrases :** 
- Défini le nombre de phrases d'entraînement générées par chaque requête.

**Activation :**
- Permet d'activer ou pas la fonctionnalité.


https://docs.google.com/document/d/12UwD9tJNiL-cUEKLddpKYIFtPMhVOnpwiMDPDfHD7eE/edit

TODO MASS
![schéma Tock](../../../../img/ecran_faq.png "Ecran de configuration")


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