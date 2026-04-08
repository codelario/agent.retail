# AI Strategy Pattern — voice-bff

Documentación técnica de la arquitectura multi-proveedor y multi-agente implementada en `apps/voice-bff`.

---

## 1. Resumen ejecutivo

`voice-bff` es un Backend-for-Frontend serverless (AWS Lambda) que actúa como intermediario entre Retell AI y los modelos de lenguaje. Retell gestiona el flujo conversacional mediante nodos con nombres semánticos (p. ej. `"Extract Name"`, `"Patient Frustrated"`). En cada turno, el BFF recibe el nombre del nodo activo y el texto del paciente, selecciona el agente correcto, llama al LLM y devuelve la respuesta de voz.

El problema central es que distintas situaciones conversacionales requieren comportamientos radicalmente diferentes: extraer un nombre de fecha de nacimiento requiere temperatura 0 y JSON estricto; manejar a un paciente frustrado requiere empatía y lenguaje cálido; resolver intención ambigua requiere razonamiento moderado. Hardcodear estas variantes en un único handler produce código frágil y difícil de extender.

La solución aplica **Strategy Pattern en dos capas**: la capa de infraestructura (`IModelProvider`) abstrae el SDK del LLM, y la capa de comportamiento (`IAgent`) abstrae el prompt y los parámetros de llamada. El resultado es una arquitectura Open/Closed: agregar un nuevo proveedor (p. ej. Mistral) o un nuevo agente (p. ej. `SummarizationAgent`) no requiere modificar ningún componente existente — solo añadir la nueva clase y registrarla en `ServiceFactory.ts`.

---

## 2. Diagrama de arquitectura

```
Retell AI
    │  POST /ai/respond
    │  { nodeId, nodeName, prompt }
    ▼
aiRespondHandler (Middy)
    │  httpJsonBodyParser → schemaValidator → cors → httpErrorHandler
    ▼
AiRespondUsecase.execute(input)
    │
    ▼
AgentSelector.select(nodeName)
    │
    ├─── EXTRACTION_NODES ──→ ExtractionAgent ──→ AnthropicProvider("claude-haiku-4-5-20251001")
    │                              temp=0, max=150 tokens, JSON estricto
    │
    ├─── EMPATHY_NODES    ──→ EmpathyAgent    ──→ AnthropicProvider("claude-sonnet-4-6")
    │                              temp=0.7, max=300 tokens, lenguaje cálido
    │
    └─── (fallback)       ──→ ReasoningAgent  ──→ AnthropicProvider("claude-sonnet-4-6")
                                   temp=0.4, max=400 tokens, routing/intención

    ▼
AgentResult { response, agentType, modelId, providerName }
    │
    ▼
HTTP 200 JSON → Retell AI
```

**Proveedores disponibles** (no todos activos en producción):

```
IModelProvider
    ├── AnthropicProvider  →  @anthropic-ai/sdk  (activo)
    ├── OpenAIProvider     →  openai SDK          (disponible, no wired)
    └── GoogleProvider     →  stub pendiente      (no implementado)
```

---

## 3. Patrones de diseño

### a. Strategy Pattern — doble nivel

**El problema:** El handler necesita comportarse de forma completamente diferente según el contexto conversacional, pero el código que llama al LLM no debería saber nada del comportamiento, y viceversa.

**Capa 1 — `IModelProvider`: intercambia el SDK del LLM sin tocar los agentes**

```typescript
// apps/voice-bff/src/ai/providers/IModelProvider.ts
export interface IModelProvider {
  readonly modelId: string
  readonly providerName: 'anthropic' | 'openai' | 'google'
  complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string>
}
```

Cualquier agente que dependa de `IModelProvider` puede ejecutarse contra Anthropic, OpenAI o Google sin cambiar una sola línea del agente.

**Capa 2 — `IAgent`: intercambia el comportamiento sin tocar la infraestructura**

```typescript
// apps/voice-bff/src/ai/agents/IAgent.ts
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
```

`AgentSelector` y `AiRespondUsecase` dependen solo de `IAgent`. No saben si hay un `ReasoningAgent`, un `ExtractionAgent` o cualquier otro — solo saben que tienen un agente con un método `run`.

---

### b. Open/Closed Principle (OCP)

El sistema está abierto a extensión y cerrado a modificación:

| Cambio | Archivos que se tocan |
|--------|----------------------|
| Agregar `MistralProvider` | Nuevo archivo `MistralProvider.ts` + 1 línea en `ServiceFactory` |
| Agregar `SummarizationAgent` | Nuevo archivo `SummarizationAgent.ts` + agregar nodo en `AgentSelector` + 1 línea en `ServiceFactory` |
| Cambiar extraction de Haiku a GPT-4o-mini | 1 línea en `ServiceFactory` |
| Agregar un nodo nuevo a un agente existente | 1 línea en `AgentSelector.ts` |

Ninguno de estos cambios toca el handler, el use case, los otros agentes ni los otros proveedores.

---

### c. Dependency Injection (constructor injection)

Los agentes no instancian su proveedor — lo reciben en el constructor:

```typescript
// apps/voice-bff/src/ai/agents/ReasoningAgent.ts
export class ReasoningAgent implements IAgent {
  readonly agentType = 'reasoning'

  constructor(private readonly provider: IModelProvider) {}

  async run(prompt: string): Promise<AgentResult> {
    const response = await this.provider.complete(
      prompt,
      REASONING_SYSTEM_PROMPT,
      400,   // maxTokens
      0.4,   // temperature
    )
    return {
      response,
      agentType: this.agentType,
      modelId: this.provider.modelId,
      providerName: this.provider.providerName,
    }
  }
}
```

`AgentSelector` tampoco instancia agentes — los recibe todos en el constructor:

```typescript
// apps/voice-bff/src/ai/AgentSelector.ts
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
```

Consecuencia: ningún componente de lógica de negocio importa clases concretas. Solo `ServiceFactory` lo hace.

---

### d. Composition Root — `ServiceFactory`

Un único archivo en todo el sistema instancia y conecta implementaciones concretas. Usa lazy singletons para que las instancias sobrevivan warm starts de Lambda:

```typescript
// apps/voice-bff/src/ioc/ServiceFactory.ts (extracto del wiring de AI)

class ServiceFactory {
  private _agentSelector?: AgentSelector
  private _aiRespondUsecase?: AiRespondUsecase

  // Providers: modelId configurable, se crea una instancia nueva cada vez
  // (los providers son stateless — el SDK gestiona conexiones internamente)
  private get anthropicSonnet() { return new AnthropicProvider('claude-sonnet-4-6') }
  private get anthropicHaiku()  { return new AnthropicProvider('claude-haiku-4-5-20251001') }

  // Agentes: provider inyectado, sin lógica de construcción interna
  private get reasoningAgent()  { return new ReasoningAgent(this.anthropicSonnet) }
  private get extractionAgent() { return new ExtractionAgent(this.anthropicHaiku) }
  private get empathyAgent()    { return new EmpathyAgent(this.anthropicSonnet) }

  // Selector: singleton, ya que su estado son solo los tres agentes pre-construidos
  get agentSelector(): AgentSelector {
    if (!this._agentSelector) {
      this._agentSelector = new AgentSelector(
        this.reasoningAgent,
        this.extractionAgent,
        this.empathyAgent,
      )
    }
    return this._agentSelector
  }

  get aiRespondUsecase(): AiRespondUsecase {
    if (!this._aiRespondUsecase) {
      this._aiRespondUsecase = new AiRespondUsecase(this.agentSelector)
    }
    return this._aiRespondUsecase
  }
}

// Singleton de módulo — misma instancia en todos los warm starts
export const factory = new ServiceFactory()
```

El patrón lazy singleton `private _field?: T; get field() { if (!this._field) this._field = new T() }` garantiza que cada servicio se construye como máximo una vez por contenedor de Lambda y que las dependencias circulares (si las hubiera) se resuelven en tiempo de acceso, no de importación.

---

### e. Facade / BFF pattern

El handler `POST /ai/respond` expone una sola operación que oculta completamente el routing interno. Retell AI no sabe que hay tres agentes distintos ni qué modelo se usa en cada caso — solo envía `nodeName` y recibe una `response` de texto:

```typescript
// apps/voice-bff/src/usecases/aiRespondUsecase.ts
export class AiRespondUsecase {
  constructor(private readonly agentSelector: AgentSelector) {}

  async execute(input: AiRespondInput): Promise<AgentResult> {
    const agent = this.agentSelector.select(input.nodeName)
    return agent.run(input.prompt)
  }
}
```

La complejidad (qué modelo, qué prompt, qué temperatura) está encapsulada detrás de esta interfaz de dos líneas.

---

## 4. Estructura de archivos

```
apps/voice-bff/src/
├── ai/
│   ├── providers/
│   │   ├── IModelProvider.ts        Contrato de infraestructura LLM
│   │   ├── AnthropicProvider.ts     @anthropic-ai/sdk — messages.create()
│   │   ├── OpenAIProvider.ts        openai SDK — chat.completions.create()
│   │   └── GoogleProvider.ts        Stub — pendiente @google/generative-ai
│   ├── agents/
│   │   ├── IAgent.ts                Contrato de comportamiento + tipo AgentResult
│   │   ├── ReasoningAgent.ts        Routing/intención, temp 0.4, max 400 tokens
│   │   ├── ExtractionAgent.ts       JSON estructurado, temp 0, max 150 tokens
│   │   └── EmpathyAgent.ts          De-escalación, temp 0.7, max 300 tokens
│   └── AgentSelector.ts             Mapeo nodeName → IAgent via Set<string>
├── handlers/
│   ├── aiRespondHandler.ts          POST /ai/respond (entry point principal)
│   ├── bookAppointmentHandler.ts    POST /appointments
│   ├── cancelAppointmentHandler.ts  PUT  /appointments/{id}/cancel
│   ├── getSlotsHandler.ts           GET  /slots
│   ├── lookupPatientHandler.ts      POST /patients/lookup
│   └── rescheduleAppointmentHandler.ts PUT /appointments/{id}/reschedule
├── ioc/
│   └── ServiceFactory.ts            Composition Root — único punto de wiring
├── middleware/
│   ├── mockJwt.ts                   Middleware de autenticación simulada
│   └── schemaValidator.ts           Validación AJV con Middy
├── repositories/
│   ├── InMemoryVoiceRepository.ts   Implementación en memoria (dev/test)
│   └── FirestoreVoiceRepository.ts  Implementación Firestore (prod)
├── schemas/
│   ├── aiRespond.schema.ts          { nodeId, nodeName, prompt } — todos required
│   ├── bookAppointment.schema.ts
│   ├── lookupPatient.schema.ts
│   └── rescheduleAppointment.schema.ts
└── usecases/
    ├── aiRespondUsecase.ts          Orquesta selector → agente → resultado
    ├── bookAppointmentUsecase.ts
    ├── cancelAppointmentUsecase.ts
    ├── getAvailableSlotsUsecase.ts
    ├── lookupPatientUsecase.ts
    ├── rescheduleAppointmentUsecase.ts
    └── types/
        ├── IVoiceRepository.ts      Interfaz del repositorio de voz
        ├── appointment.types.ts
        ├── patient.types.ts
        └── slot.types.ts
```

---

## 5. Detalle de cada componente

### Proveedores

#### `AnthropicProvider`

```typescript
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicProvider implements IModelProvider {
  readonly providerName = 'anthropic' as const
  private client = new Anthropic()  // Lee ANTHROPIC_API_KEY del entorno

  constructor(readonly modelId: string) {}

  async complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string> {
    const msg = await this.client.messages.create({
      model: this.modelId,
      max_tokens: maxTokens,
      temperature,
      system,                                              // system prompt separado
      messages: [{ role: 'user', content: prompt }],      // prompt del usuario
    })
    return (msg.content[0] as Anthropic.TextBlock).text
  }
}
```

- **API key**: `ANTHROPIC_API_KEY` en variables de entorno (leída automáticamente por el SDK)
- **Formato**: API de mensajes con `system` como campo de primer nivel (no como mensaje de rol `system`)
- **Modelos configurados**: `claude-sonnet-4-6` (reasoning/empathy), `claude-haiku-4-5-20251001` (extraction)

#### `OpenAIProvider`

```typescript
import OpenAI from 'openai'

export class OpenAIProvider implements IModelProvider {
  readonly providerName = 'openai' as const
  private client = new OpenAI()  // Lee OPENAI_API_KEY del entorno

  constructor(readonly modelId: string) {}

  async complete(prompt: string, system: string, maxTokens: number, temperature: number): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.modelId,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: system },   // system prompt como mensaje de rol
        { role: 'user', content: prompt },
      ],
    })
    return res.choices[0].message.content ?? ''
  }
}
```

- **Diferencia clave vs Anthropic**: el system prompt va como `messages[0]` con `role: 'system'`, no como campo separado
- **Estado**: disponible pero no wired en `ServiceFactory` (comentado como alternativa)

#### `GoogleProvider`

```typescript
export class GoogleProvider implements IModelProvider {
  readonly providerName = 'google' as const
  constructor(readonly modelId: string) {}

  async complete(...): Promise<string> {
    throw new Error('GoogleProvider not yet implemented. Install @google/generative-ai and implement.')
  }
}
```

- **Estado**: stub — la interfaz está definida pero la implementación está pendiente
- **Pendiente**: instalar `@google/generative-ai` e implementar `generateContent()`

---

### Agentes

#### `ReasoningAgent` — routing e intención

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| Modelo | `claude-sonnet-4-6` | Capacidad de razonamiento para ambigüedad |
| Temperature | 0.4 | Balance creatividad/determinismo para routing |
| Max tokens | 400 | Respuesta conversacional completa pero concisa |
| Uso | Fallback para todos los nodos no clasificados | |

**System prompt:**
```
You are a medical receptionist AI assistant helping route and respond to patient inquiries.
Your role is to understand patient intent, clarify ambiguous requests, and decide how to route or respond.
Be professional, concise, and helpful. When multiple intents are detected, acknowledge each one clearly.
Respond in plain conversational language suitable for a voice interaction.
```

---

#### `ExtractionAgent` — datos estructurados

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| Modelo | `claude-haiku-4-5-20251001` | Velocidad y bajo costo para extracción simple |
| Temperature | 0 | Determinismo total — JSON debe ser idéntico para el mismo input |
| Max tokens | 150 | Un objeto JSON pequeño no necesita más |
| Uso | Nodos de recolección de datos del paciente | |

**System prompt:**
```
You are a data extraction assistant for a medical office voice system.
Extract structured data from voice transcriptions and respond ONLY with valid JSON.
Do not include explanations or extra text — return only the JSON object.
If a value cannot be extracted, use null for that field.
```

---

#### `EmpathyAgent` — de-escalación y urgencia

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| Modelo | `claude-sonnet-4-6` | Comprensión emocional y matices del lenguaje |
| Temperature | 0.7 | Mayor variabilidad para respuestas más naturales y cálidas |
| Max tokens | 300 | Respuesta empática pero no excesivamente larga |
| Uso | Nodos de frustración, urgencia y situaciones difíciles | |

**System prompt:**
```
You are a warm, calm, and empathetic medical receptionist AI.
Your goal is to de-escalate frustrated or anxious patients and handle urgent situations with care.
Acknowledge the patient's feelings, validate their concern, and guide them toward a resolution.
Keep your response brief, reassuring, and suitable for voice — no lists or markdown.
```

---

## 6. Tabla de routing: nodeName → agente

### ExtractionAgent (temperatura 0, JSON estricto)

| nodeName | Descripción |
|----------|-------------|
| `Extract Name` | Extraer nombre completo del paciente |
| `Extract dob` | Extraer fecha de nacimiento |
| `Extract Phone` | Extraer número de teléfono |
| `Extract Reason` | Extraer motivo de la visita |
| `Extract Insurance` | Extraer información del seguro médico |
| `Extract Preferences` | Extraer preferencias de horario/proveedor |
| `Extract Identity` | Extraer datos de identificación |
| `Extract Variables` | Extracción genérica de variables del flujo |
| `Collect Name (New Patient)` | Recopilar nombre para paciente nuevo |
| `Collect DOB` | Recopilar fecha de nacimiento |
| `Collect Phone` | Recopilar número de teléfono |
| `Collect Reason for Visit` | Recopilar motivo de la visita |
| `Collect Insurance` | Recopilar datos del seguro |
| `Provider and Date Preference` | Recopilar preferencias de proveedor y fecha |

### EmpathyAgent (temperatura 0.7, lenguaje cálido)

| nodeName | Descripción |
|----------|-------------|
| `Patient Frustrated` | Paciente expresando frustración o enojo |
| `Urgent Routing` | Situación que requiere atención urgente |
| `Medical Emergency` | Emergencia médica — derivar con calma |
| `Change Intent / Interruption` | Paciente cambia de tema o interrumpe |
| `Question Agent Can't Answer` | Pregunta fuera del alcance del agente |
| `Extended Silence` | Silencio prolongado — re-engagement empático |

### ReasoningAgent (fallback — temperatura 0.4)

Todos los nodos no incluidos en los sets anteriores. Ejemplos típicos:

| nodeName | Descripción |
|----------|-------------|
| `Greeting` | Saludo inicial, establecer contexto |
| `Main Menu` | Opciones principales del flujo |
| `Appointment Routing` | Decidir tipo de cita |
| `Confirm Appointment` | Confirmar detalles antes de reservar |
| `Schedule Follow-up` | Agendar cita de seguimiento |
| `Insurance Verification` | Verificar cobertura |
| `Transfer to Human` | Preparar transferencia a agente humano |
| *(cualquier nodo desconocido)* | Fallback seguro con razonamiento general |

---

## 7. Contrato del endpoint

### `POST /ai/respond`

**Request body** (todos los campos requeridos, validados por AJV):

```json
{
  "nodeId":   "node_abc123",
  "nodeName": "Extract Name",
  "prompt":   "The patient said: my name is Maria García"
}
```

| Campo | Tipo | Validación |
|-------|------|-----------|
| `nodeId` | `string` | `minLength: 1` |
| `nodeName` | `string` | `minLength: 1` |
| `prompt` | `string` | `minLength: 1` |

`additionalProperties: false` — cualquier campo extra resulta en HTTP 400.

**Response 200:**

```json
{
  "response":     "I extracted the following name: Maria García",
  "agentType":    "extraction",
  "modelId":      "claude-haiku-4-5-20251001",
  "providerName": "anthropic"
}
```

**Ejemplo — ReasoningAgent:**

```bash
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node_001",
    "nodeName": "Appointment Routing",
    "prompt": "I need to see a doctor, I have been having headaches for a week"
  }'
```

```json
{
  "response": "I understand you've been experiencing headaches for a week. I can help you schedule an appointment. Would you prefer a general physician or a specialist?",
  "agentType": "reasoning",
  "modelId": "claude-sonnet-4-6",
  "providerName": "anthropic"
}
```

**Ejemplo — ExtractionAgent:**

```bash
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node_042",
    "nodeName": "Extract dob",
    "prompt": "The patient said their date of birth is March 15, 1985"
  }'
```

```json
{
  "response": "{\"date_of_birth\": \"1985-03-15\"}",
  "agentType": "extraction",
  "modelId": "claude-haiku-4-5-20251001",
  "providerName": "anthropic"
}
```

**Ejemplo — EmpathyAgent:**

```bash
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node_099",
    "nodeName": "Patient Frustrated",
    "prompt": "I have been waiting three weeks for this appointment and nobody called me back!"
  }'
```

```json
{
  "response": "I completely understand your frustration, and I'm truly sorry for the experience you've had. Three weeks without a callback is unacceptable, and I want to make this right for you right now.",
  "agentType": "empathy",
  "modelId": "claude-sonnet-4-6",
  "providerName": "anthropic"
}
```

**Error 400** (validación fallida):

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Request body validation failed"
}
```

---

## 8. Guía de extensión

### Agregar un nuevo proveedor de LLM

1. Crear `apps/voice-bff/src/ai/providers/MistralProvider.ts` implementando `IModelProvider`
2. Instalar el SDK correspondiente: `pnpm --filter @learning/voice-bff add @mistralai/mistralai`
3. Añadir `'mistral'` al union type en `IModelProvider.ts`
4. En `ServiceFactory.ts`, agregar un getter privado y usarlo donde corresponda:

```typescript
// ServiceFactory.ts
private get mistralSmall() { return new MistralProvider('mistral-small-latest') }
private get extractionAgent() { return new ExtractionAgent(this.mistralSmall) }  // cambio de 1 línea
```

Ningún agente, use case ni handler requiere modificación.

---

### Agregar un nuevo agente

1. Crear `apps/voice-bff/src/ai/agents/SummarizationAgent.ts` implementando `IAgent`
2. Definir el system prompt, `maxTokens` y `temperature` apropiados
3. Agregar los nombres de nodo que debe manejar en `AgentSelector.ts`:

```typescript
// AgentSelector.ts
const SUMMARIZATION_NODES = new Set([
  'Summarize Visit', 'End of Call Summary',
])
```

4. En `ServiceFactory.ts`, instanciar y pasar al selector:

```typescript
private get summarizationAgent() { return new SummarizationAgent(this.anthropicSonnet) }

get agentSelector(): AgentSelector {
  if (!this._agentSelector) {
    this._agentSelector = new AgentSelector(
      this.reasoningAgent,
      this.extractionAgent,
      this.empathyAgent,
      this.summarizationAgent,  // nuevo agente
    )
  }
  return this._agentSelector
}
```

(Requiere actualizar el constructor de `AgentSelector` para aceptar el cuarto parámetro y su lógica de routing.)

---

### Cambiar el proveedor de un agente existente

Una sola línea en `ServiceFactory.ts`:

```typescript
// Antes: extraction usa Haiku de Anthropic
private get extractionAgent() { return new ExtractionAgent(this.anthropicHaiku) }

// Después: extraction usa GPT-4o-mini de OpenAI
private get extractionAgent() { return new ExtractionAgent(new OpenAIProvider('gpt-4o-mini')) }
```

Ningún otro archivo cambia.

---

### Agregar un nodo a un agente existente

Una sola línea en `AgentSelector.ts`:

```typescript
const EMPATHY_NODES = new Set([
  'Patient Frustrated', 'Urgent Routing', 'Medical Emergency',
  'Change Intent / Interruption', "Question Agent Can't Answer",
  'Extended Silence',
  'Bereavement Support',  // nuevo nodo
])
```

---

## 9. Configuración y setup local

### Variables de entorno

```bash
# .env (en apps/voice-bff/ o en la raíz)
ANTHROPIC_API_KEY=sk-ant-...   # requerido para agentes activos
OPENAI_API_KEY=sk-...          # opcional — solo si se usa OpenAIProvider
API_PORT=3020                  # puerto del servidor offline (default: 3020)
```

### Comandos de desarrollo

```bash
# Desde la raíz del monorepo — iniciar todos los servicios
pnpm dev

# Solo voice-bff
pnpm --filter @learning/voice-bff dev

# Build de producción
pnpm --filter @learning/voice-bff build

# Lint
pnpm --filter @learning/voice-bff lint
```

### Puertos

| Servicio | Puerto |
|----------|--------|
| voice-bff (serverless-offline) | 3020 |
| Lambda invoke port | 3520 |

### Verificación con curl

```bash
# Health check — extraer nombre (ExtractionAgent)
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"test-1","nodeName":"Extract Name","prompt":"My name is John Smith"}'

# Verificar routing — nodo de reasoning (fallback)
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"test-2","nodeName":"Main Menu","prompt":"I need help with my appointment"}'

# Verificar empathy — paciente frustrado
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"test-3","nodeName":"Patient Frustrated","prompt":"Nobody ever answers the phone here!"}'

# Verificar validación — campo faltante (debe retornar 400)
curl -X POST http://localhost:3020/ai/respond \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"test-4","nodeName":"Extract Name"}'
```

### Middleware chain (Middy)

El handler `aiRespondHandler` aplica los middlewares en este orden:

```
1. httpJsonBodyParser()          →  Parsea el body string a objeto JS
2. schemaValidatorMiddleware()   →  Valida contra aiRespondSchema (AJV) → 400 si falla
3. cors()                        →  Agrega headers CORS a la respuesta
4. httpErrorHandler()            →  Captura errores no manejados → respuesta HTTP estructurada
```

Los orígenes CORS permitidos están definidos en `serverless.yml`:
- `http://localhost:4200` (Angular Shell)
- `http://localhost:3001` (client-mfe)
- `http://localhost:3002` (notification-mfe)
