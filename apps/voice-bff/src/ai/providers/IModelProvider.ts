export interface IModelProvider {
  readonly modelId: string
  readonly providerName: 'anthropic' | 'openai' | 'google'
  complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string>
}
