export const scenario = {
  id: '64775e830c3a7b5a5f15cc3a',
  creationDate: '2023-05-31T14:49:39.893Z',
  updateDate: '2023-05-31T14:56:05.073Z',
  state: 'CURRENT',
  comment: 'Initial version',
  data: {
    mode: 'publishing',
    scenarioItems: [
      {
        id: 0,
        from: 'client',
        text: 'Préférez vous le bleu ou le rouge ?',
        main: true,
        intentDefinition: {
          label: 'Préférez vous le bleu ou le rouge ?',
          name: 'preferezVousLeBleuOuLeRouge',
          category: 'scenarios',
          primary: true,
          sentences: [
            {
              namespace: 'namespace2',
              applicationName: 'application1',
              language: 'fr',
              query: 'Préférez vous le bleu ou le rouge ?',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: [],
          intentId: '647760040c3a7b5a5f15cc3b'
        }
      },
      {
        id: 1,
        parentIds: [0],
        from: 'bot',
        text: 'Pour une voiture ou un kangourou ?',
        actionDefinition: {
          name: 'POUR_UNE_VOITURE_OU_UN_KANGOUROU',
          description: 'Pour une voiture ou un kangourou ?',
          answers: [{ locale: 'fr', interfaceType: 0, answer: 'Pour une voiture ou un kangourou ?' }],
          inputContextNames: [],
          outputContextNames: ['KANGOUROU', 'KANGOUROU_QUESTION', 'VOITURE'],
          unknownAnswers: [],
          final: false,
          answerId: 'namespace2_scenario_Pour une voiture ou un kangourou ?'
        }
      },
      {
        id: 2,
        parentIds: [1],
        from: 'client',
        text: 'Une voiture',
        intentDefinition: {
          label: 'Une voiture',
          name: 'uneVoiture',
          category: 'scenarios',
          primary: false,
          sentences: [
            {
              namespace: 'namespace2',
              applicationName: 'application1',
              language: 'fr',
              query: 'Une voiture',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: [],
          intentId: '647760040c3a7b5a5f15cc3d'
        }
      },
      {
        id: 3,
        parentIds: [1],
        from: 'client',
        text: 'Un kangourou',
        intentDefinition: {
          label: 'Un kangourou',
          name: 'unKangourou',
          category: 'scenarios',
          primary: false,
          sentences: [
            {
              namespace: 'namespace2',
              applicationName: 'application1',
              language: 'fr',
              query: 'Un kangourou',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: [],
          intentId: '647760040c3a7b5a5f15cc3f'
        }
      },
      {
        id: 4,
        parentIds: [2],
        from: 'bot',
        text: "Ni l'une, ni l'autre...",
        final: true,
        actionDefinition: {
          name: 'NI_LUNE_NI_LAUTRE',
          description: "Ni l'une, ni l'autre...",
          answers: [{ locale: 'fr', interfaceType: 0, answer: "Ni l'une, ni l'autre..." }],
          inputContextNames: ['VOITURE'],
          outputContextNames: [],
          unknownAnswers: [],
          final: true,
          answerId: "namespace2_scenario_Ni l'une, ni l'autre..."
        }
      },
      {
        id: 5,
        parentIds: [3],
        from: 'bot',
        text: 'Je prendrais bleu',
        final: true,
        actionDefinition: {
          name: 'JE_PRENDRAIS_BLEU',
          description: 'Je prendrais bleu',
          answers: [{ locale: 'fr', interfaceType: 0, answer: 'Je prendrais bleu' }],
          inputContextNames: ['KANGOUROU'],
          outputContextNames: [],
          unknownAnswers: [],
          final: true,
          answerId: 'namespace2_scenario_Je prendrais bleu'
        }
      },
      {
        id: 6,
        parentIds: [1],
        from: 'client',
        text: 'Un kangourou ?',
        intentDefinition: {
          label: 'Un kangourou ?',
          name: 'unkangourouQuestion',
          category: 'scenarios',
          primary: false,
          sentences: [
            {
              namespace: 'namespace2',
              applicationName: 'application1',
              language: 'fr',
              query: 'Un kangourou ?',
              checkExistingQuery: false,
              state: '',
              classification: { entities: [] }
            }
          ],
          outputContextNames: [],
          intentId: '647760040c3a7b5a5f15cc41'
        }
      },
      {
        id: 7,
        parentIds: [6],
        from: 'bot',
        text: 'Pourquoi pas ?',
        actionDefinition: {
          name: 'POURQUOI_PAS',
          description: 'Pourquoi pas ?',
          answers: [{ locale: 'fr', interfaceType: 0, answer: 'Pourquoi pas ?' }],
          inputContextNames: ['KANGOUROU_QUESTION'],
          outputContextNames: [],
          unknownAnswers: [],
          final: false,
          answerId: 'namespace2_scenario_Pourquoi pas ?'
        }
      }
    ],
    contexts: [
      { name: 'KANGOUROU', type: 'string' },
      { name: 'KANGOUROU_QUESTION', type: 'string' },
      { name: 'VOITURE', type: 'string' }
    ],
    triggers: [],
    stateMachine: {
      id: 'root',
      type: 'parallel',
      states: {
        Global: {
          id: 'Global',
          states: {
            GROUP: {
              id: 'GROUP',
              states: {
                POUR_UNE_VOITURE_OU_UN_KANGOUROU: { id: 'POUR_UNE_VOITURE_OU_UN_KANGOUROU' },
                NI_LUNE_NI_LAUTRE: { id: 'NI_LUNE_NI_LAUTRE' },
                JE_PRENDRAIS_BLEU: { id: 'JE_PRENDRAIS_BLEU' },
                POURQUOI_PAS: { id: 'POURQUOI_PAS' }
              },
              on: { uneVoiture: '#NI_LUNE_NI_LAUTRE', unKangourou: '#JE_PRENDRAIS_BLEU', unkangourouQuestion: '#POURQUOI_PAS' },
              initial: 'POUR_UNE_VOITURE_OU_UN_KANGOUROU'
            }
          },
          on: { preferezVousLeBleuOuLeRouge: '#GROUP' },
          initial: 'GROUP'
        }
      },
      initial: 'Global',
      on: {}
    }
  }
};
