import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-64 border-r border-white/5 bg-[#0d111c] hidden md:flex flex-col p-4 z-30 h-full justify-between">
      <div class="space-y-6">
        <!-- Brand Header -->
        <div class="flex items-center gap-2 px-2 mb-6">
          <svg class="w-5 h-5 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="font-bold text-xl tracking-tight text-white font-sans">INSIGHT</span>
          <span class="text-[10px] bg-blue-600/30 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/20">SECURE</span>
        </div>

        <!-- Clerk Profile / Org Switcher -->
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase px-2 mb-2 tracking-widest font-mono">Workspace Settings</p>
          <div class="bg-white/5 p-2 rounded-xl border border-white/10 space-y-2 text-center">
            <button 
              (click)="authService.openOrganizationProfile()"
              class="w-full bg-[#161b29] text-white text-[11px] font-medium p-2 rounded-lg border border-white/10 hover:border-blue-500 transition-all cursor-pointer"
            >
              Manage Organization
            </button>
            <button 
              (click)="authService.signOut()"
              class="w-full bg-red-500/10 text-red-400 hover:text-red-300 text-[11px] font-medium p-2 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        <!-- Memory Bank File List -->
        <div>
          <div class="flex justify-between items-center px-2 mb-2">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Memory Bank</p>
            <span class="text-[10px] text-blue-400 font-mono font-bold">{{ filesList.length }} FILES</span>
          </div>

          <div class="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar px-1">
            <p *ngIf="filesList.length === 0" class="text-[11px] text-slate-600 italic px-2">
              No documents stored.
            </p>

            <div 
              *ngFor="let file of filesList" 
              class="flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group"
            >
              <div class="flex items-center gap-2 truncate">
                <svg class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span class="truncate max-w-[130px] font-mono text-[11px]">{{ file }}</span>
              </div>

              <button 
                *ngIf="isAdmin"
                (click)="requestDelete.emit(file)"
                class="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                title="Delete file"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Identity & Role -->
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase px-2 mb-2 tracking-widest font-mono">Identity & Role</p>
          <div class="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
            <div class="flex flex-col text-[11px] truncate w-full">
              <span class="text-white font-medium truncate" title="{{ authState?.userId }}">{{ authState?.userId || 'Unknown User' }}</span>
              <span [ngClass]="isAdmin ? 'text-green-400 font-bold' : 'text-blue-400'" class="font-mono text-[10px] mt-0.5">
                {{ isAdmin ? 'ADMIN ACCESS' : 'MEMBER ACCESS' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Purge Button -->
        <button 
          *ngIf="isAdmin"
          (click)="requestPurge.emit()"
          class="w-full flex items-center justify-center gap-2 p-2.5 text-[11px] font-mono text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          PURGE ORG MEMORY
        </button>
      </div>

      <!-- Footer node status -->
      <div class="pt-4 border-t border-white/5 text-[10px] font-mono text-slate-500 flex justify-between items-center">
        <span>FASTAPI_NODE_01</span>
        <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  @Output() requestDelete = new EventEmitter<string>();
  @Output() requestPurge = new EventEmitter<void>();

  authState: AuthState | null = null;
  filesList: string[] = [];

  constructor(
    public authService: AuthService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    this.authService.authState$.subscribe(state => {
      this.authState = state;
      if (state.orgId) {
        this.loadFiles();
      }
    });
  }

  get isAdmin(): boolean {
    return this.authState?.orgRole === 'org:admin';
  }

  public loadFiles() {
    this.documentService.getDocuments().subscribe({
      next: (res) => this.filesList = res.files || [],
      error: (err) => console.error('Error fetching documents:', err)
    });
  }
}
