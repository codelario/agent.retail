import OpenAI from 'openai'
import type { IModelProvider } from './IModelProvider'

export class OpenAIProvider implements IModelProvider {
  readonly providerName = 'openai' as const
  readonly apiKey = process.env.OPENAI_API_KEY
  private client = new OpenAI({ apiKey: this.apiKey })
  
  constructor(readonly modelId: string) {}
  
  async complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string> {
    console.log("--------------- Openai ------------")
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
