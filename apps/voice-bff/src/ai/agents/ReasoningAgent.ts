import type { IModelProvider } from '../providers/IModelProvider'
import type { IAgent, AgentResult } from './IAgent'

const REASONING_SYSTEM_PROMPT = `You are a medical receptionist AI assistant helping route and respond to patient inquiries.
Your role is to understand patient intent, clarify ambiguous requests, and decide how to route or respond.
Be professional, concise, and helpful. When multiple intents are detected, acknowledge each one clearly.
Respond in plain conversational language suitable for a voice interaction.`

export class ReasoningAgent implements IAgent {
  readonly agentType = 'reasoning'

  constructor(private readonly provider: IModelProvider) {}

  async run(prompt: string): Promise<AgentResult> {
    const response = await this.provider.complete(
      prompt,
      REASONING_SYSTEM_PROMPT,
      400,
      0.4,
    )
    return {
      response,
      agentType: this.agentType,
      modelId: this.provider.modelId,
      providerName: this.provider.providerName,
    }
  }
}
