import OpenAI from 'openai'
import type { IModelProvider } from './IModelProvider'

export class OpenAIProvider implements IModelProvider {
  readonly providerName = 'openai' as const
  private client = new OpenAI()

  constructor(readonly modelId: string) {}

  async complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.modelId,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    })
    return res.choices[0].message.content ?? ''
  }
}
