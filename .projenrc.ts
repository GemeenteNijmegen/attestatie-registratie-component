import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';
import { Transform, TypeScriptModuleResolution } from 'projen/lib/javascript';

const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
    '@types/jsonwebtoken',
    'aws-sdk-client-mock',
  ],
  name: '@gemeentenijmegen/attestatie-registratie-component',
  projenrcTs: true,
  repository: 'https://github.com/GemeenteNijmegen/attestatie-registratie-component',
  npmTrustedPublishing: true,
  deps: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/util-dynamodb',
    '@ver-id/node-client',
    'dotenv',
    'jsonwebtoken',
    'zod',
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
