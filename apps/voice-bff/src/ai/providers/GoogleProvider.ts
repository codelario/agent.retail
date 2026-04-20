import type { IModelProvider } from './IModelProvider'
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LlmGenerateOutput {
  text: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export class GoogleProvider implements IModelProvider {
  readonly providerName = 'google' as const
  readonly systemInstruction = 'Eres un asistente conciso para equipos de ventas.'

  constructor(readonly modelId: string) { }

  private getClient() {
    // const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
    const apiKey = "AIzaSyDEZbLvGVFiFqz-Eqv6dVODqtfU6o5dKQ0"
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY environment variable is not set')
    }
    return new GoogleGenerativeAI(apiKey)
  }

  async complete(prompt: string, system: string, maxOutputTokens: number, temperature: number): Promise<string> {
    console.log("------------------- Gemini (v1 Force) -------------------");
    const client = this.getClient();

    // const model = client.getGenerativeModel({
    //   model: "gemini-1.5-flash",
    // }, { apiVersion: 'v1' });

    const model = client.getGenerativeModel({
      model: "gemini-pro", 
    });

    // Concatenamos el sistema con el prompt manualmente
    const systemText = system || this.systemInstruction;
    const combinedPrompt = `System: ${systemText}\n\nUser: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: temperature ?? 0.2,
        maxOutputTokens: maxOutputTokens ?? 512
      }
    });

    const response = result.response;
    const text = response.text() ?? '';

    console.log("Respuesta obtenida:", text);
    return text;
  }
}
