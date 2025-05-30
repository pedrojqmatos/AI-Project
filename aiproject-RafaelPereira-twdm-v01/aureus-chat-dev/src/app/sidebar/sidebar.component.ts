import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, switchMap, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  chats$: Observable<any[]>;
  selectedChatId: string | null = null;

  constructor(private router: Router) {
    this.chats$ = this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.chatService.getChats();
      })
    );
  }

  openChat(id: string) {
    this.selectedChatId = id;
    this.router.navigate(['/chat', id]);
  }

  createNewChat() {
    const defaultTitle = 'New Chat';
    this.chatService.createChat(defaultTitle).then((id) => {
      this.openChat(id);
    });
  }
}
