import type { IModelProvider } from '../providers/IModelProvider'
import type { IAgent, AgentResult } from './IAgent'

const EXTRACTION_SYSTEM_PROMPT = `You are a data extraction assistant for a medical office voice system.
Extract structured data from voice transcriptions and respond ONLY with valid JSON.
Do not include explanations or extra text — return only the JSON object.
If a value cannot be extracted, use null for that field.`

export class ExtractionAgent implements IAgent {
  readonly agentType = 'extraction'

  constructor(private readonly provider: IModelProvider) {}

  async run(prompt: string): Promise<AgentResult> {
    const response = await this.provider.complete(
      prompt,
      EXTRACTION_SYSTEM_PROMPT,
      150,
      0,
    )
    return {
      response,
      agentType: this.agentType,
      modelId: this.provider.modelId,
      providerName: this.provider.providerName,
    }
  }
}
