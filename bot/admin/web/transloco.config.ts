import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'src/assets/i18n/',
  langs: ['en', 'fr'],
  scopePathMap: {
    'language-understanding': './assets/i18n/language-understanding',
    analytics: './assets/i18n/analytics'
  },
  keysManager: {
    input: 'src',
    output: 'src/assets/i18n',
    addMissingKeys: true,
    unflat: true,
    emitErrorOnExtraKeys: false
  }
};

export default config;
