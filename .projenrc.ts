import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';
import { Transform, TypeScriptModuleResolution } from 'projen/lib/javascript';

const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  name: '@gemeentenijmegen/attestatie-registratie-component',
  projenrcTs: true,
  repository: 'https://github.com/GemeenteNijmegen/attestatie-registratie-component',
  npmTrustedPublishing: true,
  releaseWorkflowEnv: {
    VER_ID_GH_TOKEN: '${{ secrets.VER_ID_GH_TOKEN }}',
  },
  buildWorkflowOptions: {
    env: {
      VER_ID_GH_TOKEN: '${{ secrets.VER_ID_GH_TOKEN }}',
    },
  },
  deps: [
    '@ver-id/node-client',
    'dotenv',
  ],
  jestOptions: {
    jestConfig: {
      roots: ['src', 'test'],
      setupFiles: ['dotenv/config'],
      transformIgnorePatterns: [
        'node_modules/(?!(@ver-id)/)',
      ],
      transform: {
        '^.+\\.tsx?$': new Transform('ts-jest', {
          tsconfig: 'tsconfig.dev.json',
        }),
        '^.+\\.m?jsx?$': new Transform('ts-jest', {
          tsconfig: 'tsconfig.dev.json',
        }),
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    },
  },
  tsconfig: {
    compilerOptions: {
      isolatedModules: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  },
  tsconfigDev: {
    compilerOptions: {
      module: 'CommonJS',
      moduleResolution: TypeScriptModuleResolution.NODE,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  },
});
project.synth();