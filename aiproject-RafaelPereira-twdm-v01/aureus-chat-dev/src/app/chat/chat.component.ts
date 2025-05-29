import { Component, inject, computed, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { AiService } from '../services/lmstudio.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'

  
})


export class ChatComponent implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);


  private route = inject(ActivatedRoute);
  router = inject(Router);
  authService = inject(AuthService);
  private chatService = inject(ChatService);
  private aiService = inject(AiService);

  showMenu = false;
  userInput = '';
  isChatActive = false;
  isLoading = false;
  chatId: string = '';
  messages: any[] = [];

  

  username = computed(() => this.authService.currentUserSig()?.username ?? null);

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/sign-in');
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.chatId = params.get('id') ?? '';
      if (this.chatId) {
        this.chatService.getMessages(this.chatId).subscribe(msgs => {
          this.messages = msgs;
        });
      }
    });
  }
  trackByIndex(index: number, item: any) {
    return index;
  }
  cleanResponse(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }
  async sendPrompt() {
  if (!this.userInput.trim()) return;

  const prompt = this.userInput.trim();

  // 1. Mostra logo a mensagem do utilizador na UI e guarda no Firestore
  this.messages.push({ sender: 'user', text: prompt });
  this.userInput = '';
  this.isLoading = true;
  await this.chatService.addMessage(this.chatId, 'user', prompt);

  // 2. Prepara o histórico para enviar no prompt à API
  // (aqui podes montar o histórico como quiseres, ou só enviar o prompt, dependendo do que a API suporta)
  const history = this.messages
    .filter(m => m.sender === 'user' || m.sender === 'ai')
    .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
    .join('\n');
  const fullPrompt = `${history}\nUser: ${prompt}\nAI:`;

  // 3. Adiciona uma mensagem vazia da AI para ir atualizando aos poucos
  const aiMessage = { sender: 'ai', text: '', animate: true };
  this.messages.push(aiMessage);

  try {
      // 4. Chama o método de streaming e vai atualizando o texto da resposta da AI
      await this.aiService.askStreaming(fullPrompt, (chunk) => {
        console.log('Chunk recebido:', chunk, new Date().toISOString());
        this.zone.run(() => {
          aiMessage.text += chunk;
          
          this.cdr.detectChanges();
          console.log('Chunk aplicado na UI');
        });
      });


    // 5. Quando o streaming terminar, limpa o texto (exemplo)
    aiMessage.text = this.cleanResponse(aiMessage.text);

    // 6. Salva no Firestore a mensagem completa da AI
    await this.chatService.addMessage(this.chatId, 'ai', aiMessage.text);

  } catch (e) {
    const errorMsg = '[Erro ao obter resposta da IA]';
    aiMessage.text = errorMsg;
    await this.chatService.addMessage(this.chatId, 'ai', errorMsg);
  } finally {
    this.isLoading = false;
  }
}

}
