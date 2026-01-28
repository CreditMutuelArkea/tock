import { EvaluationSampleDefinition, EvaluationSampleStatus } from './models';

export const EvaluationSampleData: EvaluationSampleDefinition[] = [
  {
    _id: '1',
    name: 'Echantillonage Janvier 2026',
    description: 'Evaluation de conformité janvier 2026',
    dialogActivityFrom: '2026-01-01 00:00:00Z',
    dialogActivityTo: '2026-01-31 23:59:59Z',
    allowTestDialogs: true,
    creationDate: '2026-01-08T12:17:48.519Z',
    createdBy: 'LS661',
    validationDate: null,
    validatedBy: null,
    requestedDialogCount: 50,
    dialogsCount: 50,
    totalDialogCount: 1227,
    botActionCount: 10,
    evaluationsResult: {
      positiveCount: 0,
      negativeCount: 0
    },
    status: EvaluationSampleStatus.IN_PROGRESS
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c9d0e1',
    name: 'Evaluation janvier 2027',
    description: 'Evaluation de conformité',
    dialogActivityFrom: '2026-01-01T00:00:00Z',
    dialogActivityTo: '2026-01-31T23:59:59Z',
    allowTestDialogs: true,
    creationDate: '2026-02-20T10:00:00Z',
    createdBy: 'LS661',
    validationDate: null,
    validatedBy: null,
    requestedDialogCount: 100,
    dialogsCount: 85,
    totalDialogCount: 85,
    botActionCount: 95,
    status: EvaluationSampleStatus.IN_PROGRESS,
    evaluationsResult: {
      positiveCount: 42,
      negativeCount: 12
    }
  },
  {
    _id: '2',
    name: 'Sample Dec 23 2025',
    description: '',
    dialogActivityFrom: '2026-01-01 00:00:00Z',
    dialogActivityTo: '2026-01-31 23:59:59Z',
    allowTestDialogs: false,
    creationDate: '2025-11-23T16:34:27.519Z',
    createdBy: 'LS661',
    validationDate: null,
    validatedBy: null,
    requestedDialogCount: 200,
    dialogsCount: 75,
    totalDialogCount: 75,
    botActionCount: 80,
    evaluationsResult: {
      positiveCount: 40,
      negativeCount: 40
    },
    status: EvaluationSampleStatus.IN_PROGRESS
  },
  {
    _id: '3',
    name: 'Sample Nov 15 2025',
    dialogActivityFrom: '2026-01-01 00:00:00Z',
    dialogActivityTo: '2026-01-31 23:59:59Z',
    allowTestDialogs: true,
    description:
      ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper.',
    creationDate: '2025-10-15T09:56:02.519Z',
    createdBy: 'LS661',
    validationDate: '2025-10-15T16:13:22.519Z',
    validatedBy: 'Marie-Thérèse-Antoinette de la Fontaine-Chaumont-Saint-Michel',
    requestedDialogCount: 25,
    dialogsCount: 20,
    totalDialogCount: 543,
    botActionCount: 29,
    evaluationsResult: {
      positiveCount: 23,
      negativeCount: 6
    },
    status: EvaluationSampleStatus.VALIDATED
  }
];
