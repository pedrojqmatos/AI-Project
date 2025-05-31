import {
  Component,
  inject,
  computed,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';
import { ChatService } from '../services/chat.service';
import { AiService } from '../services/lmstudio.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

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
  isLoading = false;
  isChatLoading = true; // <-- novo
  chatId: string = '';
  messages: any[] = [];

  inProgressAiText = '';

  username = computed(() => this.authService.currentUserSig()?.username ?? null);


  

  private messagesSub: Subscription | undefined;

  scrollToBottom() {
    setTimeout(() => {
      this.scrollContainer?.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/sign-in');
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (!user) {
        this.messages = [];
        this.chatId = '';
        this.isChatLoading = false;
        this.messagesSub?.unsubscribe();
        return;
      }
      console.log(this.username)
      this.route.paramMap.subscribe(params => {
        const newChatId = params.get('id') ?? '';
        if (newChatId !== this.chatId) {
          this.chatId = newChatId;
          this.messages = [];
          this.isChatLoading = true;
          this.messagesSub?.unsubscribe();

           this.messagesSub = this.chatService.getMessages(this.chatId).subscribe(msgs => {
            this.messages = msgs;
            this.isChatLoading = false;
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

    this.messages.push({ sender: 'user', text: prompt });
    this.userInput = '';
    this.isLoading = true;
    this.inProgressAiText = '';
    await this.chatService.addMessage(this.chatId, 'user', prompt);

    const history = this.messages
      .filter(m => m.sender === 'user' || m.sender === 'ai')
      .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
      .join('\n');

    const fullPrompt = `${history}\nUser: ${prompt}\nAI:`;

    let fullText = '';
    let insideThink = false;

    try {
      await this.aiService.askStreaming(fullPrompt, (chunk: string) => {
        this.zone.run(() => {
          fullText += chunk;

          if (/<think>/.test(fullText)) insideThink = true;
          if (/<\/think>/.test(fullText)) {
            insideThink = false;
            fullText = fullText.replace(/<think>[\s\S]*?<\/think>/gi, '');
          }

          if (!insideThink) {
            this.inProgressAiText = fullText.replace(/<think>[\s\S]*?<\/think>/gi, '');
          }

          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      });

      const cleanFinal = this.cleanResponse(fullText);
      this.messages.push({ sender: 'ai', text: cleanFinal });
      await this.chatService.addMessage(this.chatId, 'ai', cleanFinal);
      this.inProgressAiText = '';

    } catch (e) {
      const errorMsg = '[Erro ao obter resposta da IA]';
      this.messages.push({ sender: 'ai', text: errorMsg });
      await this.chatService.addMessage(this.chatId, 'ai', errorMsg);
      this.inProgressAiText = '';
    } finally {
      this.isLoading = false;
    }
  }
}
