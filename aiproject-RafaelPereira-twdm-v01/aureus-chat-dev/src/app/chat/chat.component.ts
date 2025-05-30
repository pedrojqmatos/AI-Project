import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { AiService } from '../services/lmstudio.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { Component, inject, computed, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';



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
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;


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

  scrollToBottom() {
    try {
      setTimeout(() => {
        this.scrollContainer?.nativeElement.scrollTo({
          top: this.scrollContainer.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); 
    } catch (e) {
      console.error('Erro no scroll:', e);
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/sign-in');
    });
  }

  private messagesSub: Subscription | undefined;

ngOnInit() {
  this.authService.user$.subscribe(user => {
    if (!user) {
      // Se não está logado, limpa estado
      this.messages = [];
      this.chatId = '';
      this.messagesSub?.unsubscribe();
      return;
    }
    
    // Agora que o user está definido, pega o chatId da rota
    this.route.paramMap.subscribe(params => {
      const newChatId = params.get('id') ?? '';
      if (newChatId !== this.chatId) {
        this.chatId = newChatId;
        this.messages = [];
        this.messagesSub?.unsubscribe();
        this.messagesSub = this.chatService.getMessages(this.chatId).subscribe(msgs => {
          this.messages = msgs;
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
    });
  });
}

ngOnDestroy() {
  this.messagesSub?.unsubscribe();
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

  // 1. Mostra mensagem do user na UI e salva no Firestore
  this.messages.push({ sender: 'user', text: prompt });
  this.userInput = '';
  this.isLoading = true;
  await this.chatService.addMessage(this.chatId, 'user', prompt);

  // 2. Prepara o histórico para o prompt da API
  const history = this.messages
    .filter(m => m.sender === 'user' || m.sender === 'ai')
    .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
    .join('\n');
  const fullPrompt = `${history}\nUser: ${prompt}\nAI:`;

  // 3. Adiciona mensagem AI vazia com flag de animação
  const aiMessage = { sender: 'ai', text: '', fullText: '', animate: true };
  this.messages.push(aiMessage);

  try {
    let fullCleanText = '';

    // 4. Streaming: adiciona chunk limpo gradualmente na UI e acumula fullText com tags
    await this.aiService.askStreaming(fullPrompt, (chunk) => {
      this.zone.run(() => {
        aiMessage.fullText += chunk;
        
        const cleanChunk = chunk.replace(/<think>[\s\S]*?<\/think>/gi, '');
        fullCleanText += cleanChunk;

        aiMessage.text = fullCleanText;

        this.messages = [...this.messages];
        this.cdr.detectChanges();
        this.scrollToBottom();
      });
    });

    // 5. Quando termina o streaming, salva no Firestore só o texto limpo
    await this.chatService.addMessage(this.chatId, 'ai', fullCleanText);

  } catch (e) {
    const errorMsg = '[Erro ao obter resposta da IA]';
    aiMessage.text = errorMsg;
    await this.chatService.addMessage(this.chatId, 'ai', errorMsg);
  } finally {
    this.isLoading = false;
  }
}

}
