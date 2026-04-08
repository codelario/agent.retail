import type { IModelProvider } from './IModelProvider'

// Stub — implementar con @google/generative-ai cuando se requiera
export class GoogleProvider implements IModelProvider {
  readonly providerName = 'google' as const

  constructor(readonly modelId: string) {}

  async complete(_prompt: string, _system: string, _maxTokens: number, _temperature: number): Promise<string> {
    throw new Error('GoogleProvider not yet implemented. Install @google/generative-ai and implement.')
  }
}
