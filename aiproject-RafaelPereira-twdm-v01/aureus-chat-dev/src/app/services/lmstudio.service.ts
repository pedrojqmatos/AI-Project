// services/lmstudio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  constructor(private http: HttpClient) {}

  async ask(prompt: string): Promise<string> {
    const body = {
      model: 'qwen3-1.7b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: false
    };

    const response: any = await firstValueFrom(
      this.http.post('http://localhost:1234/v1/chat/completions', body, {
        headers: { 'Content-Type': 'application/json' }
      })
    );

    return response?.choices?.[0]?.message?.content ?? '[Erro na resposta da IA]';
  }
}
