export const scenario = {
  id: '647f4a516fd0011f387a90d0',
  creationDate: '2023-06-06T15:01:37.791Z',
  updateDate: '2023-06-08T10:13:14.557Z',
  state: 'DRAFT',
  comment: 'V13 CURRENT CURRENT',
  data: {
    mode: 'casting',
    scenarioItems: [
      {
        id: 0,
        from: 'client',
        text: 'Je souhaite déclarer un bris de glace svp',
        main: true,
        intentDefinition: {
          label: 'Je souhaite déclarer un bris de glace svp',
          name: 'declarerunbrisdeglace',
          category: 'Assurance',
          description: "Procédure de déclaration d'un bris de glace",
          primary: true,
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'Je souhaite déclarer un bris de glace svp',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: []
        }
      },
      {
        id: 1,
        parentIds: [0],
        from: 'bot',
        text: "Très bien afin de créer le dossier de sinistre pouvez-vous me donner un numéro de contrat ou d'immatriculation?",
        actionDefinition: {
          name: 'DEMANDER_CONTRAT_OU_IMMATRICULATION',
          description: "Très bien afin de créer le dossier de sinistre pouvez-vous me donner un numéro de contrat ou d'immatriculation?",
          answers: [
            {
              answer: "Très bien afin de créer le dossier de sinistre pouvez-vous me donner un numéro de contrat ou d'immatriculation?",
              interfaceType: 0,
              locale: 'fr'
            }
          ],
          inputContextNames: [],
          outputContextNames: ['IMMATRICULATION', 'NUM_CONTRAT'],
          unknownAnswers: [
            {
              locale: 'fr',
              interfaceType: 0,
              answer: 'Sois plus explicite stp'
            }
          ],
          final: false
        }
      },
      {
        id: 2,
        parentIds: [1],
        from: 'client',
        text: 'Mon immatriculation est RH-458-LN',
        intentDefinition: {
          label: 'Mon immatriculation est RH-458-LN',
          name: 'preciserimmatriculation',
          category: 'Identification véhicule',
          description: "Récupération de la plaque d'immatriculation du client",
          primary: false,
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'Mon immatriculation est RH-458-LN',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: []
        }
      },
      {
        id: 3,
        parentIds: [1],
        from: 'client',
        text: 'Mon numéro de contrat est le 32145678',
        intentDefinition: {
          label: 'Mon numéro de contrat est le 32145678',
          name: 'precisernumerocontrat',
          category: 'Identification contrat',
          description: 'Récupérer le numéro de contrat du client',
          primary: false,
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'Mon numéro de contrat est le 32145678',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: []
        }
      },
      {
        id: 4,
        parentIds: [2],
        from: 'bot',
        text: 'Récupération infos client et véhicule via plaque immat',
        actionDefinition: {
          name: 'RECUP_INFOS_CONTRAT_PAR_IMMAT',
          description: 'Récupération infos client et véhicule via plaque immat',
          handler: 'avenir-assurance:get_contract_by_immat',
          inputContextNames: ['IMMATRICULATION'],
          outputContextNames: ['NUM_CONTRAT'],
          final: false
        }
      },
      {
        id: 5,
        parentIds: [4],
        from: 'bot',
        text: 'Pouvez-vous me confirmer que vous êtes bien Mr Barbeau et que le sinistre concerne le véhicule Peugeot 2008?',
        actionDefinition: {
          name: 'CONFIRM_CLIENT_IDENTIFICATION',
          description: 'Pouvez-vous me confirmer que vous êtes bien Mr Barbeau et que le sinistre concerne le véhicule Peugeot 2008?',
          inputContextNames: ['NOM_CLIENT', 'LABEL_VEHICULE'],
          outputContextNames: ['IDENT_CLIENT_OK'],
          final: false,
          answers: [
            {
              answer: 'Pouvez-vous me confirmer que vous êtes bien Mr Barbeau et que le sinistre concerne le véhicule Peugeot 2008?',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 6,
        parentIds: [5],
        from: 'client',
        text: 'Accept',
        intentDefinition: {
          label: 'Accept',
          name: 'accept',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'super',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "s'il vous plait",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est bien ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est bien moi",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['IDENT_CLIENT_OK']
        }
      },
      {
        id: 8,
        parentIds: [53],
        from: 'bot',
        text: 'Votre numéro de téléphone est bien le 06 05 47 15 48?',
        actionDefinition: {
          name: 'VERIFIER_TEL',
          description: 'Votre numéro de téléphone est bien le 06 05 47 15 48?',
          inputContextNames: ['BESOIN_VERIFIER_TEL'],
          outputContextNames: ['RESOLVE_VERIF_TEL', 'TEL_KO'],
          final: false,
          answers: [
            {
              answer: 'Je dois maintenant confirmer votre numéro de tel\nVotre numéro de téléphone est bien le 06 05 47 15 48?',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 18,
        parentIds: [54],
        from: 'bot',
        text: 'Votre adresse email est bien m.barbeau@orange.fr?',
        actionDefinition: {
          name: 'VERIFIER_MAIL',
          description: 'Votre adresse email est bien m.barbeau@orange.fr?',
          inputContextNames: ['BESOIN_VERIFIER_MAIL'],
          outputContextNames: ['RESOLVE_VERIF_MAIL', 'MAIL_KO'],
          final: false,
          answers: [
            {
              answer: 'Je dois maintenant confirmer votre email\nVotre adresse email est bien m.barbeau@orange.fr?',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 25,
        parentIds: [6],
        from: 'bot',
        text: 'Vérifier si besoin confirmer tel et email',
        actionDefinition: {
          name: 'SHOULD_CHECK_PHONE_AND_MAIL',
          description: 'Vérifier si besoin confirmer tel et email',
          handler: 'avenir-assurance:should_check_phone_and_mail',
          inputContextNames: ['IDENT_CLIENT_OK'],
          outputContextNames: ['BESOIN_VERIFIER_MAIL_ET_TEL', 'RESOLVE_VERIF_TEL', 'RESOLVE_VERIF_MAIL'],
          final: false
        }
      },
      {
        id: 26,
        parentIds: [25],
        from: 'bot',
        text: 'Pouvez-vous me décrire votre bris de glace?',
        actionDefinition: {
          name: 'DEMANDER_DETAIL_BRIS_DE_GLACE',
          description: 'Pouvez-vous me décrire votre bris de glace?',
          inputContextNames: ['END_RESOLVE_MAIL', 'END_RESOLVE_TEL'],
          outputContextNames: ['DETAIL_SINISTRE'],
          final: false,
          answers: [
            {
              answer: 'Pouvez-vous me décrire votre bris de glace?',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 27,
        parentIds: [26],
        from: 'client',
        text: "J'ai reçu un caillou en roulant sur l'autoroute",
        intentDefinition: {
          label: "J'ai reçu un caillou en roulant sur l'autoroute",
          name: 'descriptionbrisdeglace',
          category: 'Sinistre',
          description: 'Description du bris de glace',
          primary: false,
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query:
                'Bah heu, il était plutôt de couleur… Rouge ? Non, fraise ! Plutôt fraise ! Assez rond, un peu en longueur, assez classe quoi. Le beau bris de glace quoi.',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "J'ai reçu un caillou en roulant sur l'autoroute",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: []
        }
      },
      {
        id: 28,
        parentIds: [27],
        from: 'bot',
        text: "Pouvez-vous enfin m'indiquer la commune dans laquelle a eu lieu le bris de glace?",
        actionDefinition: {
          name: 'DEMANDER_LIEU_SINISTRE',
          description: "Pouvez-vous enfin m'indiquer la commune dans laquelle a eu lieu le bris de glace?",
          inputContextNames: ['DETAIL_SINISTRE'],
          outputContextNames: ['VILLE_SINISTRE'],
          final: false,
          answers: [
            {
              answer: "Pouvez-vous enfin m'indiquer la commune dans laquelle a eu lieu le bris de glace?",
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 29,
        parentIds: [28],
        from: 'client',
        text: 'Cétait autour de Montpellier',
        intentDefinition: {
          label: 'Cétait autour de Montpellier',
          name: 'preciservillesinistre',
          category: 'Localisation',
          primary: false,
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'Trifouillis-les-oies',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: []
        }
      },
      {
        id: 30,
        parentIds: [29],
        from: 'bot',
        text: "Parfait, j'ai bien noté qu'il s'agissait de la commune de Montpellier\n=> Création dossier sinistre",
        actionDefinition: {
          name: 'CREATION_DOSSIER_SINISTRE',
          description: "Parfait, j'ai bien noté qu'il s'agissait de la commune de Montpellier\n=> Création dossier sinistre",
          handler: 'avenir-assurance:create_sinistre',
          inputContextNames: ['VILLE_SINISTRE'],
          outputContextNames: ['NUM_DOSSIER_SINISTRE'],
          final: false,
          answers: [
            {
              answer: "Parfait, j'ai créé votre dossier de sinistre",
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 31,
        parentIds: [30],
        from: 'bot',
        text: 'Je vais vous faire parvenir par email la liste de nos partenaire à proximité de votre domicile.\nVous pouvez les contacter directement afin de programmer la réparation',
        actionDefinition: {
          name: 'ENVOI_LISTE_PARTENAIRES',
          description:
            'Je vais vous faire parvenir par email la liste de nos partenaire à proximité de votre domicile.\nVous pouvez les contacter directement afin de programmer la réparation',
          handler: 'avenir-assurance:send_partenaires',
          inputContextNames: ['NUM_DOSSIER_SINISTRE'],
          outputContextNames: ['RESOLVE_SINISTRE'],
          final: false,
          answers: [
            {
              answer:
                'Je vais vous faire parvenir par email la liste de nos partenaire à proximité de votre domicile.\nVous pouvez les contacter directement afin de programmer la réparation',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 33,
        parentIds: [3],
        from: 'bot',
        text: 'Récupération infos client et véhicule via numéro contrat',
        actionDefinition: {
          name: 'RECUP_INFOS_CLIENT_PAR_CONTRAT',
          description: 'Récupération infos client et véhicule via numéro contrat',
          handler: 'avenir-assurance:get_client_infos_by_contract',
          inputContextNames: ['NUM_CONTRAT'],
          outputContextNames: ['NOM_CLIENT', 'LABEL_VEHICULE'],
          final: false
        }
      },
      {
        id: 35,
        parentIds: [31],
        from: 'bot',
        text: 'Resolve_DECLARATION BRISE GLACE',
        final: true,
        actionDefinition: {
          name: 'RESOLVE_DECLARATION_BRIS_GLACE_',
          description: 'RESOLVE DECLARATION BRISE GLACE',
          inputContextNames: ['RESOLVE_SINISTRE'],
          outputContextNames: [],
          final: true,
          answers: [
            {
              answer: 'FIN - Resolve declaration bris glace',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 36,
        parentIds: [8],
        from: 'client',
        text: 'Accept',
        intentDefinition: {
          label: 'Accept',
          name: 'accept',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'super',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "s'il vous plait",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est bien ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est bien moi",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['RESOLVE_VERIF_TEL']
        }
      },
      {
        id: 37,
        parentIds: [8],
        from: 'client',
        text: 'refuse',
        intentDefinition: {
          label: 'refuse',
          name: 'refuse',
          category: 'tick',
          description: 'Desc',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non je ne prefere pas',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est toto@lamobilette.fr",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non ca n'est pas lka bonne",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non j'en ai changé",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est pas le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est pas ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['TEL_KO']
        }
      },
      {
        id: 38,
        parentIds: [18],
        from: 'client',
        text: 'Accept',
        intentDefinition: {
          label: 'Accept',
          name: 'accept',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'super',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "s'il vous plait",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est bien ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est bien moi",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['RESOLVE_VERIF_MAIL']
        }
      },
      {
        id: 39,
        parentIds: [18],
        from: 'client',
        text: 'refuse',
        intentDefinition: {
          label: 'refuse',
          name: 'refuse',
          category: 'tick',
          description: 'Desc',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non je ne prefere pas',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est toto@lamobilette.fr",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non ca n'est pas lka bonne",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non j'en ai changé",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est pas le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est pas ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['MAIL_KO']
        }
      },
      {
        id: 41,
        parentIds: [37],
        from: 'bot',
        text: 'DEMANDE_ENREGISTRER_NUM_TEL',
        actionDefinition: {
          name: 'DEMANDE_ENREGISTRER_NUM_TEL',
          description: 'DEMANDE_ENREGISTRER_NUM_TEL',
          inputContextNames: ['TEL_KO'],
          outputContextNames: ['NEW_TEL', 'REFUSE_UPDATE_TEL'],
          final: false,
          answers: [
            {
              answer:
                'Pas de problème souhaitez-vous que nous enregistrions le numéro 06 32 17 85 62 avec lequel vous nous appelez actuellement?',
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 42,
        parentIds: [41],
        from: 'client',
        text: 'Accept',
        intentDefinition: {
          label: 'Accept',
          name: 'accept',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'super',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "s'il vous plait",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est bien ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "oui c'est bien moi",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'oui',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['NEW_TEL']
        }
      },
      {
        id: 43,
        parentIds: [41],
        from: 'client',
        text: 'refuse',
        intentDefinition: {
          label: 'refuse',
          name: 'refuse',
          category: 'tick',
          description: 'Desc',
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non je ne prefere pas',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non merci',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est toto@lamobilette.fr",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non ca n'est pas lka bonne",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non j'en ai changé",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est pas le bon",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "non c'est pas ça",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'non',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: ['REFUSE_UPDATE_TEL']
        }
      },
      {
        id: 44,
        parentIds: [42],
        from: 'bot',
        text: 'MISE_A_JOUR_DU_NUMERO',
        actionDefinition: {
          name: 'MISE_A_JOUR_DU_NUMERO',
          description: 'MISE_A_JOUR_DU_NUMERO',
          handler: 'avenir-assurance:update_client_phone',
          inputContextNames: ['NEW_TEL'],
          outputContextNames: ['RESOLVE_VERIF_TEL'],
          final: false
        }
      },
      {
        id: 46,
        parentIds: [44],
        from: 'bot',
        text: 'RESOLVE_VALIDATE_CLIENT_PHONE',
        actionDefinition: {
          name: 'RESOLVE_VALIDATE_CLIENT_PHONE',
          description: 'RESOLVE_VALIDATE_CLIENT_PHONE',
          handler: 'avenir-assurance:set_end_resolve_tel',
          inputContextNames: ['RESOLVE_VERIF_TEL'],
          outputContextNames: ['END_RESOLVE_TEL'],
          final: false
        }
      },
      {
        id: 47,
        parentIds: [43],
        from: 'bot',
        text: 'END_VALIDATE_PHONE',
        actionDefinition: {
          name: 'END_VALIDATE_PHONE',
          description: 'END_VALIDATE_PHONE',
          handler: 'avenir-assurance:set_resolve_verif_tel',
          inputContextNames: ['REFUSE_UPDATE_TEL'],
          outputContextNames: ['RESOLVE_VERIF_TEL'],
          final: false,
          answers: [{ answer: 'Très bien', interfaceType: 0, locale: 'fr' }]
        }
      },
      {
        id: 49,
        parentIds: [39],
        from: 'bot',
        text: 'DEMANDER_NEW_MAIL',
        actionDefinition: {
          name: 'DEMANDER_NEW_MAIL',
          description: 'DEMANDER_NEW_MAIL',
          inputContextNames: ['MAIL_KO'],
          outputContextNames: ['NEW_MAIL'],
          final: false,
          answers: [
            {
              answer: "Pouvez-vous m'épeler votre nouvelle adresse email?",
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 50,
        parentIds: [49],
        from: 'client',
        text: 'precisernouveaumail',
        intentDefinition: {
          label: 'precisernouveaumail',
          name: 'precisernouveaumail',
          category: 'scenarios',
          primary: false,
          sentences: [
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: "c'est toto@lamobilette.fr",
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            },
            {
              namespace: 'app',
              applicationName: 'new_assistant',
              language: 'fr',
              query: 'toto@lamobilette.fr',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: []
        }
      },
      {
        id: 51,
        parentIds: [50],
        from: 'bot',
        text: 'CONFIRM_NEW_MAIL',
        actionDefinition: {
          name: 'CONFIRM_NEW_MAIL',
          description: 'CONFIRM_NEW_MAIL',
          handler: 'avenir-assurance:resolve_verif_mail',
          inputContextNames: ['NEW_MAIL'],
          outputContextNames: ['RESOLVE_VERIF_MAIL'],
          final: false,
          answers: [
            {
              answer: "J'ai bien mis à jour votre adresse mail avec michel.barbeau@free.fr",
              interfaceType: 0,
              locale: 'fr'
            }
          ]
        }
      },
      {
        id: 52,
        parentIds: [51],
        from: 'bot',
        text: 'RESOLVE_VALIDATE_CLIENT_EMAIL',
        actionDefinition: {
          name: 'RESOLVE_VALIDATE_CLIENT_EMAIL',
          description: 'RESOLVE_VALIDATE_CLIENT_EMAIL',
          handler: 'avenir-assurance:set_end_resolve_mail',
          inputContextNames: ['RESOLVE_VERIF_MAIL'],
          outputContextNames: ['END_RESOLVE_MAIL'],
          final: false
        }
      },
      {
        id: 53,
        parentIds: [25],
        from: 'bot',
        text: 'CHECK_BESOIN_VERIF_TEL',
        actionDefinition: {
          name: 'CHECK_BESOIN_VERIF_TEL',
          description: 'CHECK_BESOIN_VERIF_TEL',
          handler: 'avenir-assurance:check_besoin_verif_tel',
          inputContextNames: ['BESOIN_VERIFIER_MAIL_ET_TEL'],
          outputContextNames: ['RESOLVE_VERIF_TEL', 'BESOIN_VERIFIER_TEL'],
          final: false,
          trigger: 'veriftel'
        }
      },
      {
        id: 54,
        parentIds: [25],
        from: 'bot',
        text: 'CHECK_BESOIN_VERIF_MAIL',
        actionDefinition: {
          name: 'CHECK_BESOIN_VERIF_MAIL',
          description: 'CHECK_BESOIN_VERIF_MAIL',
          handler: 'avenir-assurance:check_besoin_verif_mail',
          inputContextNames: ['BESOIN_VERIFIER_MAIL_ET_TEL'],
          outputContextNames: ['BESOIN_VERIFIER_MAIL', 'RESOLVE_VERIF_MAIL'],
          final: false,
          trigger: 'verifmail'
        }
      }
    ],
    contexts: [
      {
        name: 'IMMATRICULATION',
        type: 'string',
        entityType: 'app:immatriculation',
        entityRole: 'immatriculation'
      },
      {
        name: 'NUM_CONTRAT',
        type: 'string',
        entityType: 'app:num_contrat',
        entityRole: 'num_contrat'
      },
      { name: 'RESOLVE_VERIF_TEL', type: 'string' },
      { name: 'RESOLVE_VERIF_MAIL', type: 'string' },
      {
        name: 'NEW_MAIL',
        type: 'string',
        entityType: 'duckling:email',
        entityRole: 'new_mail'
      },
      {
        name: 'VILLE_SINISTRE',
        type: 'string',
        entityType: 'app:ville_sinistre',
        entityRole: 'ville_sinistre'
      },
      { name: 'NOM_CLIENT', type: 'string' },
      { name: 'LABEL_VEHICULE', type: 'string' },
      { name: 'IDENT_CLIENT_OK', type: 'string' },
      { name: 'BESOIN_VERIFIER_MAIL_ET_TEL', type: 'string' },
      { name: 'TEL_KO', type: 'string' },
      { name: 'MAIL_KO', type: 'string' },
      { name: 'NEW_TEL', type: 'string' },
      {
        name: 'DETAIL_SINISTRE',
        type: 'string',
        entityType: 'app:detail_sinistre',
        entityRole: 'detail_sinistre'
      },
      { name: 'NUM_DOSSIER_SINISTRE', type: 'string' },
      { name: 'RESOLVE_SINISTRE', type: 'string' },
      { name: 'REFUSE_UPDATE_TEL', type: 'string' },
      { name: 'BESOIN_VERIFIER_TEL', type: 'string' },
      { name: 'BESOIN_VERIFIER_MAIL', type: 'string' },
      { name: 'END_RESOLVE_MAIL', type: 'string' },
      { name: 'END_RESOLVE_TEL', type: 'string' }
    ],
    stateMachine: {
      id: 'root',
      type: 'parallel',
      states: {
        Global: {
          id: 'Global',
          states: {
            DECLARATION_DE_SINISTRE_BRIS_DE_GLACE: {
              id: 'DECLARATION_DE_SINISTRE_BRIS_DE_GLACE',
              states: {
                DEMANDER_CONTRAT_OU_IMMATRICULATION: {
                  id: 'DEMANDER_CONTRAT_OU_IMMATRICULATION'
                },
                RECUP_INFOS_CONTRAT_PAR_IMMAT: {
                  id: 'RECUP_INFOS_CONTRAT_PAR_IMMAT'
                },
                CONFIRM_CLIENT_IDENTIFICATION: {
                  id: 'CONFIRM_CLIENT_IDENTIFICATION'
                },
                SHOULD_CHECK_PHONE_AND_MAIL: {
                  id: 'SHOULD_CHECK_PHONE_AND_MAIL'
                },
                DEMANDER_DETAIL_BRIS_DE_GLACE: {
                  id: 'DEMANDER_DETAIL_BRIS_DE_GLACE'
                },
                DEMANDER_LIEU_SINISTRE: {
                  id: 'DEMANDER_LIEU_SINISTRE'
                },
                CREATION_DOSSIER_SINISTRE: {
                  id: 'CREATION_DOSSIER_SINISTRE'
                },
                ENVOI_LISTE_PARTENAIRES: {
                  id: 'ENVOI_LISTE_PARTENAIRES'
                },
                RECUP_INFOS_CLIENT_PAR_CONTRAT: {
                  id: 'RECUP_INFOS_CLIENT_PAR_CONTRAT'
                },
                RESOLVE_DECLARATION_BRIS_GLACE_: {
                  id: 'RESOLVE_DECLARATION_BRIS_GLACE_'
                },
                MAJ_TEL: {
                  id: 'MAJ_TEL',
                  states: {
                    VERIFIER_TEL: { id: 'VERIFIER_TEL', on: {} },
                    DEMANDE_ENREGISTRER_NUM_TEL: {
                      id: 'DEMANDE_ENREGISTRER_NUM_TEL',
                      on: {}
                    },
                    MISE_A_JOUR_DU_NUMERO: {
                      id: 'MISE_A_JOUR_DU_NUMERO'
                    },
                    RESOLVE_VALIDATE_CLIENT_PHONE: {
                      id: 'RESOLVE_VALIDATE_CLIENT_PHONE'
                    },
                    END_VALIDATE_PHONE: { id: 'END_VALIDATE_PHONE' },
                    CHECK_BESOIN_VERIF_TEL: {
                      id: 'CHECK_BESOIN_VERIF_TEL'
                    }
                  },
                  on: {
                    accept: '#RESOLVE_VALIDATE_CLIENT_PHONE',
                    refuse: '#RESOLVE_VALIDATE_CLIENT_PHONE'
                  },
                  initial: 'RESOLVE_VALIDATE_CLIENT_PHONE'
                },
                MAJ_MAIL: {
                  id: 'MAJ_MAIL',
                  states: {
                    VERIFIER_MAIL: { id: 'VERIFIER_MAIL', on: {} },
                    DEMANDER_NEW_MAIL: { id: 'DEMANDER_NEW_MAIL' },
                    CONFIRM_NEW_MAIL: { id: 'CONFIRM_NEW_MAIL' },
                    CHECK_BESOIN_VERIF_MAIL: {
                      id: 'CHECK_BESOIN_VERIF_MAIL'
                    },
                    RESOLVE_VALIDATE_CLIENT_EMAIL: {
                      id: 'RESOLVE_VALIDATE_CLIENT_EMAIL'
                    }
                  },
                  on: {
                    precisernouveaumail: '#RESOLVE_VALIDATE_CLIENT_EMAIL',
                    accept: '#RESOLVE_VALIDATE_CLIENT_EMAIL',
                    refuse: '#RESOLVE_VALIDATE_CLIENT_EMAIL'
                  },
                  initial: 'RESOLVE_VALIDATE_CLIENT_EMAIL'
                }
              },
              on: {
                preciserimmatriculation: '#RESOLVE_DECLARATION_BRIS_GLACE_',
                precisernumerocontrat: '#RESOLVE_DECLARATION_BRIS_GLACE_',
                descriptionbrisdeglace: '#RESOLVE_DECLARATION_BRIS_GLACE_',
                preciservillesinistre: '#RESOLVE_DECLARATION_BRIS_GLACE_',
                verifmail: '#MAJ_MAIL',
                veriftel: '#MAJ_TEL',
                accept: '#RESOLVE_DECLARATION_BRIS_GLACE_'
              },
              initial: 'RESOLVE_DECLARATION_BRIS_GLACE_'
            }
          },
          on: {
            declarerunbrisdeglace: '#DECLARATION_DE_SINISTRE_BRIS_DE_GLACE'
          },
          initial: 'DECLARATION_DE_SINISTRE_BRIS_DE_GLACE'
        }
      },
      initial: 'Global',
      on: {}
    },
    triggers: ['veriftel', 'verifmail']
  }
};
