import Anthropic from '@anthropic-ai/sdk'
import type { IModelProvider } from './IModelProvider'

export class AnthropicProvider implements IModelProvider {
  readonly providerName = 'anthropic' as const
  private client = new Anthropic()

  constructor(readonly modelId: string) {}

  async complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string> {
    const msg = await this.client.messages.create({
      model: this.modelId,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: prompt }],
    })
    return (msg.content[0] as Anthropic.TextBlock).text
  }
}
