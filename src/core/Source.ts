import { Base } from './Base';

export interface SourceConfig {}

export interface SourceOptions<TConfig extends SourceConfig = SourceConfig> {
  name: string;
  config: TConfig;
}

export abstract class Source<T = unknown, TConfig extends SourceConfig = SourceConfig> extends Base {
  readonly name: string;

  constructor(protected readonly options: SourceOptions<TConfig>) {
    super();
    this.name = options.name;
  }

  abstract fetch(id: string): Promise<T>;
}
