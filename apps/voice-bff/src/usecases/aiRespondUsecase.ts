import type { AgentSelector } from '../ai/AgentSelector'
import type { AgentResult } from '../ai/agents/IAgent'

export interface AiRespondInput {
  nodeId: string
  nodeName: string
  prompt: string
}

export class AiRespondUsecase {
  constructor(private readonly agentSelector: AgentSelector) {}

  async execute(input: AiRespondInput): Promise<AgentResult> {
    console.log("🚀 ~ AiRespondUsecase ~ execute ~ input.nodeName:", input.nodeName)
    const agent = this.agentSelector.select(input.nodeName)
    return agent.run(input.prompt)
  }
}
