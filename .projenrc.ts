import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  name: '@gemeentenijmegen/attestatie-registratie-component',
  projenrcTs: true,
  repository: 'https://github.com/GemeenteNijmegen/attestatie-registratie-component',
  npmTrustedPublishing: true,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
  gitignore: [
    '.npmrc'
  ]
});
project.synth();