import { Component, inject, computed } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AiService } from '../services/huggingface.service' // ajusta o caminho se necessário
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NgIf, NgFor, FormsModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  aiService = inject(AiService);

  showMenu = false;
  userInput = '';
  animateResponse = false;
  aiResponse = '';
  isChatActive = false;
  isLoading = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/sign-in');
    });
  }

  username = computed(() => this.authService.currentUserSig()?.username ?? null);

  async sendPrompt() {
    if (!this.userInput.trim()) return;
    this.isLoading = true;
    this.isChatActive = true;
    this.aiResponse = '';
    this.animateResponse = false;

    try {
      const response = await this.aiService.ask(this.userInput);
      this.aiResponse = response;

      // força reflow e ativa a animação
      setTimeout(() => {
        this.animateResponse = true;
      }, 20);

    } catch {
      this.aiResponse = 'An error occurred while fetching the AI response.';
    } finally {
      this.isLoading = false;
    }
  }
}
