import { Component, inject, computed, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { AiService } from '../services/lmstudio.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
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

  async sendPrompt() {
    if (!this.userInput.trim()) return;

    const prompt = this.userInput.trim();
    this.messages.push({ sender: 'user', text: prompt });
    this.userInput = '';
    this.isLoading = true;

    await this.chatService.addMessage(this.chatId, 'user', prompt);

    const history = this.messages.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
    const fullPrompt = `${history}\nUser: ${prompt}\nAI:`;

    try {
      const response = await this.aiService.ask(fullPrompt);
      const aiMessage = { sender: 'ai', text: response, animate: true };
      this.messages.push(aiMessage);
      await this.chatService.addMessage(this.chatId, 'ai', response);
    } catch (e) {
      const errorMsg = '[Erro ao obter resposta da IA]';
      this.messages.push({ sender: 'ai', text: errorMsg });
      await this.chatService.addMessage(this.chatId, 'ai', errorMsg);
    } finally {
      this.isLoading = false;
    }
  }
}
