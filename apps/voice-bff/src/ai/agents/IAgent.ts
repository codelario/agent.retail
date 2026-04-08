export interface AgentResult {
  response: string
  agentType: string
  modelId: string
  providerName: string
}

export interface IAgent {
  readonly agentType: string
  run(prompt: string): Promise<AgentResult>
}
