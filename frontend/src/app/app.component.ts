import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ModalComponent } from './components/modal/modal.component';
import { DocumentService } from './core/services/document.service';
import { ChatService } from './core/services/chat.service';
import { AuthService, AuthState } from './core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatWindowComponent, ModalComponent],
  template: `
    <div class="flex h-screen bg-[#0B0F1A] text-slate-200 font-sans relative">
      
      <!-- Loading State -->
      <div *ngIf="!authState.isLoaded" class="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-transparent z-0"></div>
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4 z-10"></div>
        <p class="text-slate-400 z-10 font-medium">Securing session...</p>
      </div>

      <!-- Logged Out State -->
      <div *ngIf="authState.isLoaded && !authState.isSignedIn" class="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
        
        <!-- Background Effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent z-0"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

        <div class="z-10 bg-[#12182B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-10 max-w-md w-full shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-3 tracking-tight">InsightStream</h1>
          <p class="text-slate-400 mb-8 text-sm leading-relaxed">Enterprise AI Knowledge Base. Securely access your organization's memory.</p>
          
          <button (click)="authService.signIn()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5">
            Sign In with Clerk
          </button>
        </div>
      </div>

      <!-- No Organization State -->
      <div *ngIf="authState.isLoaded && authState.isSignedIn && !authState.orgId" class="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
         <div class="z-10 bg-[#12182B]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-10 max-w-md w-full shadow-2xl text-center">
            <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-3">Organization Required</h2>
            <p class="text-slate-400 mb-8 text-sm">Data isolation is strictly enforced. You must select or create an organization to proceed.</p>
            
            <button (click)="authService.openOrganizationProfile()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5">
              Manage Organizations
            </button>
            <button (click)="authService.signOut()" class="mt-4 w-full bg-transparent border border-white/5 hover:bg-white/5 text-slate-400 hover:text-slate-300 font-medium py-2.5 px-4 rounded-xl transition-all">
              Sign Out
            </button>
         </div>
      </div>

      <!-- Authenticated & Org Selected State (Main App) -->
      <ng-container *ngIf="authState.isLoaded && authState.isSignedIn && authState.orgId">
        <!-- Sidebar -->
        <app-sidebar 
          #sidebar
          (requestDelete)="onDeleteRequested($event)"
          (requestPurge)="onPurgeRequested()"
        ></app-sidebar>

        <!-- Main Chat Area -->
        <app-chat-window class="flex-1 h-full"></app-chat-window>
      </ng-container>

      <!-- Custom Warning Modal -->
      <app-modal
        [isOpen]="modalOpen"
        [type]="modalType"
        [targetName]="targetName"
        (onConfirm)="handleModalConfirm()"
        (onCancel)="modalOpen = false"
      ></app-modal>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidebar') sidebar!: SidebarComponent;

  modalOpen: boolean = false;
  modalType: 'delete' | 'purge' = 'delete';
  targetName: string = '';

  authState: AuthState = { isLoaded: false, isSignedIn: false, userId: null, orgId: null, orgRole: null };
  private authSub!: Subscription;

  constructor(
    private documentService: DocumentService,
    private chatService: ChatService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.authSub = this.authService.authState$.subscribe(state => {
      this.authState = state;
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onDeleteRequested(filename: string) {
    this.modalType = 'delete';
    this.targetName = filename;
    this.modalOpen = true;
  }

  onPurgeRequested() {
    this.modalType = 'purge';
    // Instead of raw session, we use the auth state
    this.targetName = this.authState.orgId || 'Organization';
    this.modalOpen = true;
  }

  handleModalConfirm() {
    this.modalOpen = false;

    if (this.modalType === 'delete') {
      const file = this.targetName;
      this.documentService.deleteDocument(file).subscribe({
        next: (res) => {
          this.chatService.addMessage({
            role: 'system',
            content: `SYSTEM: "${file}" removed from memory.`
          });
          if (this.sidebar) this.sidebar.loadFiles();
        },
        error: (err) => console.error(err)
      });
    } else if (this.modalType === 'purge') {
      this.documentService.purgeMemory().subscribe({
        next: (res) => {
          this.chatService.clearMessages();
          this.chatService.addMessage({
            role: 'system',
            content: 'SYSTEM: Memory bank purged by administrator.'
          });
          if (this.sidebar) this.sidebar.loadFiles();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
