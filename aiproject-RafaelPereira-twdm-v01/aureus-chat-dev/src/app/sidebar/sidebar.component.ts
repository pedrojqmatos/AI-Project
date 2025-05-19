import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.service';
import { NgFor } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private chatService = inject(ChatService);
  private router = inject(Router);

  chats$: Observable<any[]> = this.chatService.getChats();

  async createNewChat() {
    const title = `Chat - ${new Date().toLocaleString()}`;
    const newChatId = await this.chatService.createChat(title);
    this.router.navigateByUrl(`/chat/${newChatId}`);
  }

  openChat(chatId: string) {
    this.router.navigateByUrl(`/chat/${chatId}`);
  }
}