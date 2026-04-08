import { ConsoleAdapter } from '@learning/logger';
import type { ILogger } from '@learning/logger';
import type { IVoiceRepository } from '../usecases/types/IVoiceRepository';
import { InMemoryVoiceRepository } from '../repositories/InMemoryVoiceRepository';
import { GetAvailableSlotsUsecase } from '../usecases/getAvailableSlotsUsecase';
import { LookupPatientUsecase } from '../usecases/lookupPatientUsecase';
import { BookAppointmentUsecase } from '../usecases/bookAppointmentUsecase';
import { CancelAppointmentUsecase } from '../usecases/cancelAppointmentUsecase';
import { RescheduleAppointmentUsecase } from '../usecases/rescheduleAppointmentUsecase';
import { AnthropicProvider } from '../ai/providers/AnthropicProvider';
// OpenAIProvider available: import { OpenAIProvider } from '../ai/providers/OpenAIProvider';
import { ReasoningAgent } from '../ai/agents/ReasoningAgent';
import { ExtractionAgent } from '../ai/agents/ExtractionAgent';
import { EmpathyAgent } from '../ai/agents/EmpathyAgent';
import { AgentSelector } from '../ai/AgentSelector';
import { AiRespondUsecase } from '../usecases/aiRespondUsecase';
import { GoogleProvider } from '../ai/providers/GoogleProvider';

// Composition Root — único lugar donde se instancian y conectan los servicios.
// Los getters son lazy: solo se instancian la primera vez que se acceden.
class ServiceFactory {
  private _logger?: ILogger;
  private _voiceRepository?: IVoiceRepository;
  private _getAvailableSlotsUsecase?: GetAvailableSlotsUsecase;
  private _lookupPatientUsecase?: LookupPatientUsecase;
  private _bookAppointmentUsecase?: BookAppointmentUsecase;
  private _cancelAppointmentUsecase?: CancelAppointmentUsecase;
  private _rescheduleAppointmentUsecase?: RescheduleAppointmentUsecase;
  private _agentSelector?: AgentSelector;
  private _aiRespondUsecase?: AiRespondUsecase;

  get logger(): ILogger {
    if (!this._logger) {
      this._logger = new ConsoleAdapter();
    }
    return this._logger;
  }

  private get voiceRepository(): IVoiceRepository {
    if (!this._voiceRepository) {
      this._voiceRepository = new InMemoryVoiceRepository();
    }
    return this._voiceRepository;
  }

  get getAvailableSlotsUsecase(): GetAvailableSlotsUsecase {
    if (!this._getAvailableSlotsUsecase) {
      this._getAvailableSlotsUsecase = new GetAvailableSlotsUsecase(this.voiceRepository);
    }
    return this._getAvailableSlotsUsecase;
  }

  get lookupPatientUsecase(): LookupPatientUsecase {
    if (!this._lookupPatientUsecase) {
      this._lookupPatientUsecase = new LookupPatientUsecase(this.voiceRepository);
    }
    return this._lookupPatientUsecase;
  }

  get bookAppointmentUsecase(): BookAppointmentUsecase {
    if (!this._bookAppointmentUsecase) {
      this._bookAppointmentUsecase = new BookAppointmentUsecase(this.voiceRepository);
    }
    return this._bookAppointmentUsecase;
  }

  get cancelAppointmentUsecase(): CancelAppointmentUsecase {
    if (!this._cancelAppointmentUsecase) {
      this._cancelAppointmentUsecase = new CancelAppointmentUsecase(this.voiceRepository);
    }
    return this._cancelAppointmentUsecase;
  }

  get rescheduleAppointmentUsecase(): RescheduleAppointmentUsecase {
    if (!this._rescheduleAppointmentUsecase) {
      this._rescheduleAppointmentUsecase = new RescheduleAppointmentUsecase(this.voiceRepository);
    }
    return this._rescheduleAppointmentUsecase;
  }

  // AI providers — configurados con modelos específicos
  // Para cambiar extraction a OpenAI: reemplazar this.anthropicHaiku por new OpenAIProvider('gpt-4o-mini')
  private get anthropicSonnet() { return new AnthropicProvider('claude-sonnet-4-6'); }
  private get anthropicHaiku()  { return new AnthropicProvider('claude-haiku-4-5-20251001'); }
  // private get googleHaiku()  { return new GoogleProvider('claude-haiku-4-5-20251001'); }

  // AI agents — provider inyectado como dependencia (Open/Closed: cambiar provider sin tocar el agente)
  private get reasoningAgent()  { return new ReasoningAgent(this.anthropicSonnet); }
  private get extractionAgent() { return new ExtractionAgent(this.anthropicHaiku); }
  private get empathyAgent()    { return new EmpathyAgent(this.anthropicSonnet); }

  get agentSelector(): AgentSelector {
    if (!this._agentSelector) {
      this._agentSelector = new AgentSelector(this.reasoningAgent, this.extractionAgent, this.empathyAgent);
    }
    return this._agentSelector;
  }

  get aiRespondUsecase(): AiRespondUsecase {
    if (!this._aiRespondUsecase) {
      this._aiRespondUsecase = new AiRespondUsecase(this.agentSelector);
    }
    return this._aiRespondUsecase;
  }
}

// Singleton exportado — la misma instancia se reutiliza en warm starts de Lambda
export const factory = new ServiceFactory();
