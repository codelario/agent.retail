import type { IModelProvider } from '../providers/IModelProvider'
import type { IAgent, AgentResult } from './IAgent'

const EMPATHY_SYSTEM_PROMPT = `You are a warm, calm, and empathetic medical receptionist AI.
Your goal is to de-escalate frustrated or anxious patients and handle urgent situations with care.
Acknowledge the patient's feelings, validate their concern, and guide them toward a resolution.
Keep your response brief, reassuring, and suitable for voice — no lists or markdown.`

export class EmpathyAgent implements IAgent {
  readonly agentType = 'empathy'

  constructor(private readonly provider: IModelProvider) {}

  async run(prompt: string): Promise<AgentResult> {
    const response = await this.provider.complete(
      prompt,
      EMPATHY_SYSTEM_PROMPT,
      300,
      0.7,
    )
    return {
      response,
      agentType: this.agentType,
      modelId: this.provider.modelId,
      providerName: this.provider.providerName,
    }
  }
}
