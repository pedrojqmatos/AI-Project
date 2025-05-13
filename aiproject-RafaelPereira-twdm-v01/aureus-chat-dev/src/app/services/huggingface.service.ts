//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

import { Injectable } from '@angular/core';
import { InferenceClient } from '@huggingface/inference';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private client = new InferenceClient(environment.huggingfaceToken);

  constructor() {}

  async ask(prompt: string): Promise<string> {
    try {
      const result = await this.client.chatCompletion({
        provider: 'hyperbolic',
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return result.choices[0].message.content ?? 'No response from AI.';
    } catch (error) {
      console.error('Erro ao contactar a IA:', error);
      return 'Something went wrong while trying to contact the AI.';
    }
  }
}
