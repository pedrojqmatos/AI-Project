import { Component, inject, computed, AfterViewInit } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AiService } from '../services/lmstudio.service' // ajusta o caminho se necessário
import { FormsModule } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NgIf, NgFor, FormsModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
  
})
export class MainLayoutComponent implements AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);
  aiService = inject(AiService);

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  showMenu = false;
  userInput = '';
  isChatActive = false;
  isLoading = false;

  messages: { sender: 'user' | 'ai', text: string, animate: boolean }[] = [];

  username = computed(() => this.authService.currentUserSig()?.username ?? null);

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/sign-in');
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom(); // garante scroll no início, se houver mensagens
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 300); // tempo da animação reveal-text
  }

  async sendPrompt() {
    const prompt = this.userInput.trim();
    if (!prompt) return;

    this.isLoading = true;
    this.isChatActive = true;

    this.messages.push({ sender: 'user', text: prompt, animate: false });
    this.scrollToBottom();

    try {
      const history = this.messages
      .slice(0, -1) // remove a última mensagem (que é o prompt atual)
      .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
      .join('\n');

      const fullPrompt = `${history}\nUser: ${prompt}\nAI:`;

      const response = await this.aiService.ask(fullPrompt);


      this.messages.push({ sender: 'ai', text: response, animate: true });
      this.scrollToBottom();

    } catch {
      this.messages.push({ sender: 'ai', text: 'An error occurred while fetching the AI response.', animate: false });
      this.scrollToBottom();
    } finally {
      this.userInput = '';
      this.isLoading = false;
    }
  }
}