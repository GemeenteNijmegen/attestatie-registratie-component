import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';

const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  name: '@gemeentenijmegen/attestatie-registratie-component',
  projenrcTs: true,
  repository: 'https://github.com/GemeenteNijmegen/attestatie-registratie-component',
  npmTrustedPublishing: true,
  workflowBootstrapSteps: [
    {
      name: 'Setup .npmrc for GitHub Packages',
      run: 'echo "//npm.pkg.github.com/:_authToken=${{ secrets.VER_ID_GH_TOKEN }}" >> .npmrc',
    },
  ],
  releaseWorkflowEnv: {
    VER_ID_GH_TOKEN: '${{ secrets.VER_ID_GH_TOKEN }}',
  },
  deps: [
    '@ver-id/node-client',
    'dotenv'
  ],
  jestOptions: {
    jestConfig: {
      roots: ['src', 'test']
    }
  },
  tsconfig: {
    compilerOptions: {
      isolatedModules: true,
    },
  },
});
project.synth();