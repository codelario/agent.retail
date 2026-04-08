import type { IAgent } from './agents/IAgent'

const EXTRACTION_NODES = new Set([
  'Extract Name', 'Extract dob', 'Extract Phone', 'Extract Reason',
  'Extract Insurance', 'Extract Preferences', 'Extract Identity', 'Extract Variables',
  'Collect Name (New Patient)', 'Collect DOB', 'Collect Phone',
  'Collect Reason for Visit', 'Collect Insurance', 'Provider and Date Preference',
])

const EMPATHY_NODES = new Set([
  'Patient Frustrated', 'Urgent Routing', 'Medical Emergency',
  'Change Intent / Interruption', "Question Agent Can't Answer",
  'Extended Silence',
])

export class AgentSelector {
  constructor(
    private readonly reasoning: IAgent,
    private readonly extraction: IAgent,
    private readonly empathy: IAgent,
  ) {}

  select(nodeName: string): IAgent {
    if (EXTRACTION_NODES.has(nodeName)) return this.extraction
    if (EMPATHY_NODES.has(nodeName)) return this.empathy
    return this.reasoning
  }
}
